/**
 * Image Logic
 */

class ImageSample {
  constructor(config) {
    this.mutationRate = config.mutationRate;
    this.shapeRate = config.shapeRate;
    this.target = config.target
    this.width = config.width;
    this.height = config.height;

    if (config.image) {
      this.image = config.image;
    } else {
      this.randomizeImage();
    }
  }

  randomizeImage() {
    let baseImageLayer = new ImageData(this.width, this.height);

    if (this.image) {
      baseImageLayer = this.image;
    }

    helpContext.putImageData(baseImageLayer, 0, 0);

    const color = this.getRandomColor();

    if (Math.random() < this.shapeRate) {
      const x = this.getRandomInt(0, this.width);
      const y = this.getRandomInt(0, this.height);
      const radius = this.getRandomFloat(1, Math.min(this.width / 2, this.height / 2));

      this.drawCircle(helpContext, color, x, y, radius);
    } else {
      const coordinates = [
        this.getRandomInt(0, this.width),
        this.getRandomInt(0, this.height),
        this.getRandomInt(0, this.width),
        this.getRandomInt(0, this.height),
        this.getRandomInt(0, this.width),
        this.getRandomInt(0, this.height),
      ];

      this.drawShape(helpContext, color, coordinates);
    }

    this.image = helpContext.getImageData(0, 0, this.width, this.height);
    this.fitness = this.computeFitness(this.target);
  }

  getRandomColor() {
    var letters = "0123456789ABCDEF";
    var color = "#";
    for (var i = 0; i < 8; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
  
  getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }
  
  getRandomFloat(min, max) {
    return Math.random() * (max - min) + min;
  }

  drawCircle(ctx, color, x, y, radius) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }
  
  drawShape(ctx, color, coords) {
    // the triangle
    ctx.beginPath();
    ctx.moveTo(coords[0], coords[1]);
    for (let i = 2; i < coords.length; i += 2) {
      ctx.lineTo(coords[i], coords[i + 1]);
    }
    ctx.closePath();
  
    // the fill color
    ctx.fillStyle = color;
    ctx.fill();
  }

  mutate() {
    const mutationChance = 0.5 || Math.random();

    if (this.mutationRate < mutationChance) return;

    this.randomizeImage();
  }

  crossover(partner) {
    let crossoverRate = Math.floor(Math.random() * partner.image.data.length);
    crossoverRate = crossoverRate > 0 ? crossoverRate : 0.5;

    const parentsMutationRate = (this.mutationRate + partner.mutationRate) / 2;
    const parentsShapeRate = (this.shapeRate + partner.shapeRate) / 2;
    let offspringImage = this.image;

    const parentImageData1 = this.image.data;
    const parentImageData2 = partner.image.data;

    for (var i = 0; i < parentImageData1.length; i += 4) {
      offspringImage.data[i] = parentImageData1[i] * crossoverRate + parentImageData2[i] * (1 - crossoverRate); // red
      offspringImage.data[i + 1] = parentImageData1[i + 1] * crossoverRate + parentImageData2[i + 1] * (1 - crossoverRate); // green
      offspringImage.data[i + 2] = parentImageData1[i + 2] * crossoverRate + parentImageData2[i + 2] * (1 - crossoverRate); // blue
    }

    const offspring1 = {
      mutationRate: (Math.random() + parentsMutationRate) / 2,
      shapeRate: (Math.random() + parentsShapeRate) / 2,
      target: this.target,
      width: this.width,
      height: this.height,
      image: offspringImage
    };

    const offspring2 = {
      mutationRate: (Math.random() + parentsMutationRate) / 2,
      shapeRate: (Math.random() + parentsShapeRate) / 2,
      target: this.target,
      width: this.width,
      height: this.height,
      image: offspringImage
    }

    return [new ImageSample(offspring1), new ImageSample(offspring2)];
  }

  computeFitness(target) {
    this.fitness = 0;

    for (let i = 0; i < target.data.length; i += 4) {
      this.fitness +=
        Math.abs(target.data[i] - this.image.data[i]) + // red
        Math.abs(target.data[i + 1] -  this.image.data[i + 1]) + // green
        Math.abs(target.data[i + 2] -  this.image.data[i + 2]); // blue
    }
  }
}

/**
 * Image Population Logic
 */

class ImageSamplePopulation {
  constructor(target, populationSize)  {
    this.imageSamples = [];
    this.oldImageSamples = [];

    const { width, height } = target;
    this.target = target;
    this.width = width;
    this.height = height;

    this.generationNo = 0;

    while (populationSize--) {
      this.imageSamples.push(new ImageSample({
        mutationRate: Math.random(),
        shapeRate: Math.random(),
        target: this.target,
        width: this.width,
        height: this.height
      }));
    }

    
    this.bestImageSample = this.imageSamples[0];
  }

  sortFitness(a, b) {
    return a.fitness - b.fitness;
  }

  showGeneration() {
    const maxDiff = this.width * this.height * 3 * 255;
    
    genSpan.textContent = this.generationNo;
    matchSpan.textContent = (100 * (1 - this.bestImageSample.fitness / maxDiff)).toFixed(2);
    ctx.putImageData(this.bestImageSample.image, 0, 0);
  }

  populate() {
    this.imageSamples.sort(this.sortFitness);
    this.showGeneration();
    this.oldImageSamples = this.imageSamples;

    const crossoverChance = 0.5 || Math.random();
    const bestParent = 0;

    let randomParent = Math.floor(Math.random() * this.imageSamples.length);
    randomParent = randomParent > 0 && Math.random() > crossoverChance ? randomParent : 1;

    const offsprings = this.imageSamples[bestParent].crossover(this.imageSamples[randomParent]);

    this.imageSamples.splice(this.imageSamples.length - 2, 2, offsprings[0], offsprings[1]);

    let perfectGeneration = true;
    for (let i = 0; i < this.imageSamples.length; i++) {
      this.imageSamples[i].mutate();
      this.imageSamples[i].computeFitness(this.target);

      if (this.imageSamples[i].image != this.target) {
        perfectGeneration = false;
      }
    }

    if (perfectGeneration) {
      this.imageSamples.sort(this.sortFitness);
      this.showGeneration();
    } else {
      this.generationNo++;
      
      const self = this;
      setTimeout(function() {
        const bestsImageSamples = [...self.findXBest(self.oldImageSamples, 5), ...self.findXBest(self.imageSamples, 5)];
        bestsImageSamples.sort(self.sortFitness);

        self.bestImageSample = bestsImageSamples[0];

        for (let i = 10; i < self.imageSamples.length; i++) {
          self.imageSamples[i].image = bestsImageSamples[i % 1].image;
          self.imageSamples[i].fitness = bestsImageSamples[i % 1].fitness;
        }

        self.populate();
      }, 20);
    }
  }

  findXBest(arr, x) {
    if (arr.length < x) x = arr.length - 1;
    return [...arr].sort((a, b) => a.fitness - b.fitness).slice(0, x)
  }
}

/**
 * Main JS
 */

const image = document.getElementById("genetic-image");
const matchSpan = document.querySelector("#match_percentage");
const genSpan = document.querySelector("#gen_count");

const canvas = document.querySelector("#genetic-canvas");
const ctx = canvas.getContext("2d");

const helpCanvas = document.createElement("canvas");
const helpContext = helpCanvas.getContext("2d");

resizeCanvas(image.width, image.height);
let mainImageData = getImageData(image);

const populationSize = 200;
let population = new ImageSamplePopulation(mainImageData, populationSize);
population.populate();

/**
 * Other Scripts
 */

const dropArea = document.getElementById("dropzone");

["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
  dropArea.addEventListener(eventName, preventDefaults, false);
  document.body.addEventListener(eventName, preventDefaults, false);
});
["dragenter", "dragover"].forEach((eventName) => {
  dropArea.addEventListener(eventName, highlight, false);
});
["dragleave", "drop"].forEach((eventName) => {
  dropArea.addEventListener(eventName, unhighlight, false);
});

dropArea.addEventListener("drop", handleDrop, false);
dropArea.addEventListener("input", handleChange, false);

function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

function highlight() {
  dropArea.classList.add("highlight");
}

function unhighlight() {
  dropArea.classList.remove("highlight");
}

function handleChange(e) {
  handleFiles(e.target.files)
}

function handleDrop({ dataTransfer }) {
  handleFiles(dataTransfer.files);
}

function handleFiles(file) {
  if (file.length === 0) {
    console.error('No file provided');
    return
  }
  const reader = new FileReader();
  reader.addEventListener('loadend', () => {
    const tempImage = new Image();
    tempImage.addEventListener('load', () => {
      const { width, height } = tempImage;
      image.addEventListener('load', () => {
        resizeCanvas(width, height);
        mainImageData = getImageData(tempImage);

        population = new ImageSamplePopulation(mainImageData, populationSize);
        population.populate();
      });
      image.src = reader.result;
    });
    tempImage.src = reader.result;
  });
  reader.readAsDataURL(file[0]);
}

/**
 * Other Logics
 */

function resizeCanvas(width, height) {
  canvas.width = helpCanvas.width = width;
  canvas.height = helpCanvas.height = height;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function getImageData(image) {
  helpCanvas.width = image.width;
  helpCanvas.height = image.height;

  helpContext.drawImage(image, 0, 0);
  
  const data = helpContext.getImageData(0, 0, image.width, image.height);
  
  helpContext.clearRect(0, 0, helpCanvas.width, helpCanvas.height);

  return data;
}