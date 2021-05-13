const $canvas = document.querySelector("#genetic-canvas");
const $image = document.getElementById("genetic-image");
const $matchSpan = document.querySelector("#match_percentage");
const $genSpan = document.querySelector("#gen_count");

const ctx = $canvas.getContext("2d");
const helpCanvas = document.createElement("canvas");
const helpContext = helpCanvas.getContext("2d");

let mainImageData = null;

$image.addEventListener('load', () => {
  handleLoad($image);
});

$image.src = './assets/img/sunflower.jpg'

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
    $image.src = reader.result;
  });
  reader.readAsDataURL(file[0]);
}

function handleLoad(image) {
  const newSize = getNewSize(image)
  if (newSize) {
    resizeImage(image, newSize.width, newSize.height)
    return
  }
  resizeCanvas(image.naturalWidth, image.naturalHeight);
  mainImageData = getImageData(image);
  genetic();
}

function resizeImage(image, width, height) {
  helpCanvas.width = width
  helpCanvas.height = height
  helpContext.drawImage(image, 0, 0, width, height)
  image.src = helpCanvas.toDataURL()
}

function getNewSize(image) {
  const maxWidth = 300;
  const maxHeight = 300;
  let { naturalWidth: width, naturalHeight: height } = image;

  if (width <= maxWidth && height <= maxHeight){
    return null
  }

  if (width > height) {
    if (width > maxWidth) {
      height *= maxWidth / width;
      width = maxWidth;
    }
  } else {
    if (height > maxHeight) {
      width *= maxHeight / height;
      height = maxHeight;
    }
  }
  return { width, height };
}

function genetic() {
  const { width, height, data } = mainImageData;
  const maxDiff = getMaxDiff(data);
  const popSize = 50;
  
  const olds = Array(popSize).fill(0).map(() => ({
    imageData: new ImageData(width, height),
    fitness: maxDiff,
  }));
  const news = Array(popSize).fill(0).map(() => ({
    imageData: new ImageData(width, height),
    fitness: maxDiff,
  }));

  let theBest = olds[0];

  let generation = 0;

  setTimeout(iteration, 0)
  requestAnimationFrame(drawLoop)

  function drawLoop() {
    drawBest();
    requestAnimationFrame(drawLoop);
  }

  function drawBest() {
    $genSpan.textContent = generation;
    $matchSpan.textContent = (100 * (1 - theBest.fitness / maxDiff)).toFixed(2);
    ctx.putImageData(theBest.imageData, 0, 0);
  }

  function iteration() {
    generation += 1;
    for (let i = 0; i < olds.length; i++) {
      helpContext.putImageData(olds[i].imageData, 0, 0);
      const color = getRandomColor();
      if (Math.random() < 0.5) {
        drawCircle(
          helpContext,
          color,
          getRandomInt(0, width),
          getRandomInt(0, height),
          getRandomFloat(1, Math.min(width / 2, height / 2))
        );
      } else {
        const coords = [
          getRandomInt(0, width),
          getRandomInt(0, height),
          getRandomInt(0, width),
          getRandomInt(0, height),
          getRandomInt(0, width),
          getRandomInt(0, height),
        ];
        drawShape(helpContext, color, coords);
      }
      const imgData = helpContext.getImageData(0, 0, width, height);
      news[i].imageData = imgData;
      news[i].fitness = calcFitness(mainImageData.data, imgData.data);
    }
    const bests = [...findXBest(olds, 5), ...findXBest(news, 5)];
    bests.sort(sortFitness);
    theBest = bests[0];
    for (let i = 10; i < olds.length; i++) {
      olds[i].imageData = bests[i % 10].imageData;
      olds[i].fitness = bests[i % 10].fitness;
    }
    setTimeout(iteration, 0)
  }
}

function sortFitness(a, b) {
  return a.fitness - b.fitness;
}

function findXBest(arr, x) {
  if (arr.length < x) throw new Error("Array length must be greater than x.");
  return [...arr].sort((a, b) => a.fitness - b.fitness).slice(0, x)
}

function resizeCanvas(width, height) {
  $canvas.width = helpCanvas.width = width;
  $canvas.height = helpCanvas.height = height;
  ctx.clearRect(0, 0, $canvas.width, $canvas.height);
}

function getImageData(image) {
  helpCanvas.width = image.naturalWidth;
  helpCanvas.height = image.naturalHeight;
  helpContext.drawImage(image, 0, 0);
  const data = helpContext.getImageData(0, 0, helpCanvas.width, helpCanvas.height);
  helpContext.clearRect(0, 0, helpCanvas.width, helpCanvas.height);
  return data;
}

function mutate(m, t) {
  const n = [];
  for (let i = 0; i < m.length; i++) {
    n.push(Math.random() < 0.5 ? m[i] : t[i]);
  }
  return n;
}

function calcFitness(original, current) {
  let sum = 0;
  for (let i = 0; i < original.length; i += 4) {
    const diff = Math.sqrt(
      Math.pow(original[i] - current[i], 2)
      + Math.pow(original[i + 1] - current[i + 1], 2)
      + Math.pow(original[i + 2] - current[i + 2], 2)
    )
    sum += diff
  }
  return sum;
}

function getMaxDiff(original) {
  let sum = 0;
  for (let i = 0; i < original.length; i += 4) {
    sum += Math.sqrt(
      Math.pow(original[i], 2)
      + Math.pow(original[i + 1], 2)
      + Math.pow(original[i + 2], 2)
    );
  }
  return sum;
}

function drawCircle(ctx, color, x, y, radius) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

function drawShape(ctx, color, coords) {
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

function getRandomColor() {
  var letters = "0123456789ABCDEF";
  var color = "#";
  for (var i = 0; i < 8; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function getRandomFloat(min, max) {
  return Math.random() * (max - min) + min;
}
