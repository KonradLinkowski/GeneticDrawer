const canvas = document.querySelector('#genetic-canvas')
const ctx = canvas.getContext('2d')
const image = document.querySelector('#genetic-image')
const helpCanvas = document.createElement('canvas')
const helpContext = helpCanvas.getContext('2d')

const offsprings = new Array(200)

resizeCanvas(image.width, image.height)

const imageData = getImageData(image)

genetic()

function genetic() {
  for (let i = 0; i < offsprings.length; i++) {
    offsprings[i] = { imageData: new ImageData(image.width, image.height) }
  }
  setInterval(iteration, 100)
  function iteration() {
    for (let i = 0; i < offsprings.length; i++) {
      helpContext.putImageData(offsprings[i].imageData, 0, 0)
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
      offsprings[i].imageData = helpContext.getImageData(0, 0, image.width, image.height)
      offsprings[i].fitness = calcFitness(imageData.data, offsprings[i].imageData.data)
    }
    const sorted = offsprings.sort((a, b) => {
      return a.fitness - b.fitness
    })
    ctx.putImageData(sorted[0].imageData, 0, 0)
    console.log(sorted[0].fitness)
    for (let i = 5; i < offsprings.length; i++) {
      offsprings[i].imageData.data.set(offsprings[i % 5])
    }
}
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