const canvas = document.querySelector('#genetic-canvas')
const ctx = canvas.getContext('2d')
const image = document.querySelector('#genetic-image')
const helpCanvas = document.createElement('canvas')
const helpContext = helpCanvas.getContext('2d')

const matchSpan = document.querySelector('#match_percentage')

resizeCanvas(image.width, image.height)

const mainImageData = getImageData(image)

genetic()

function genetic() {
  const maxDiff = mainImageData.data.length * 255
  const olds = new Array(200)
  const news = new Array(200)
  const defaultFit = calcFitness(mainImageData.data, new ImageData(image.width, image.height).data)
  for (let i = 0; i < olds.length; i++) {
    olds[i] = { imageData: new ImageData(image.width, image.height), fitness: defaultFit }
    news[i] = { imageData: new ImageData(image.width, image.height), fitness: defaultFit }
  }
  setInterval(iteration, 100)
  function iteration() {
    for (let i = 0; i < olds.length; i++) {
      helpContext.putImageData(olds[i].imageData, 0, 0)
      const color = getRandomColor()
      const coords = [
        getRandomInt(0, image.width),
        getRandomInt(0, image.height),
        getRandomInt(0, image.width),
        getRandomInt(0, image.height),
        getRandomInt(0, image.width),
        getRandomInt(0, image.height)
      ]

      drawShape(
        helpContext,
        color,
        coords
      )
      const imgData = helpContext.getImageData(0, 0, image.width, image.height)
      news[i].imageData = imgData
      news[i].fitness = calcFitness(mainImageData.data, imgData.data)
    }
    news.sort(sortFitness)
    olds.sort(sortFitness)
    const bests = news.slice(0, 5).concat(olds.slice(0, 5))
    bests.sort(sortFitness)
    const theBest = bests[0]
    ctx.putImageData(theBest.imageData, 0, 0)
    matchSpan.textContent = (100 * (1 - theBest.fitness / maxDiff)).toFixed(2)
    for (let i = 10; i < olds.length; i++) {
      olds[i].imageData = bests[i % 10].imageData
      olds[i].fitness = bests[i % 10].fitness
    }
  }
}

function sortFitness(a, b) {
  return a.fitness - b.fitness
}

function resizeCanvas(width, height) {
  canvas.width = width
  canvas.height = height
}

function getImageData(image) {
  helpContext.drawImage(image, 0, 0)
  const data = helpContext.getImageData(0, 0, image.width, image.height)
  helpContext.clearRect(0, 0, helpCanvas.width, helpCanvas.height)
  return data
}

function calcFitness(original, current) {
  let sum = 0
  for (let i = 0; i < original.length; i++) {
    sum += Math.abs(original[i] - current[i])
  }
  return sum
}

function drawShape(ctx, color, coords) {
  // the triangle
  ctx.beginPath()
  ctx.moveTo(coords[0], coords[1])
  for (let i = 2; i < coords.length; i += 2) {
    ctx.lineTo(coords[i], coords[i + 1])
  }
  ctx.closePath()
  
  // the fill color
  ctx.fillStyle = color
  ctx.fill()
}

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}