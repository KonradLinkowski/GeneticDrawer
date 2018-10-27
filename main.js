const canvas = document.querySelector('#genetic-canvas')
const image = document.querySelector('#genetic-image')
const matchSpan = document.querySelector('#match_percentage')
const genSpan = document.querySelector('#gen_count')

const ctx = canvas.getContext('2d')
const helpCanvas = document.createElement('canvas')
const helpContext = helpCanvas.getContext('2d')
const mainImageData = getImageData(image)

resizeCanvas(image.width, image.height)

genetic()

function genetic() {
  const maxDiff = mainImageData.width * mainImageData.height * 3 * 255
  const olds = new Array(200)
  const news = new Array(200)
  let theBest = olds[0]
  let generation = 0
  const defaultFit = calcFitness(mainImageData.data, new ImageData(image.width, image.height).data)
  for (let i = 0; i < olds.length; i++) {
    olds[i] = { imageData: new ImageData(image.width, image.height), fitness: defaultFit }
    news[i] = { imageData: new ImageData(image.width, image.height), fitness: defaultFit }
  }
  setTimeout(iteration, 0)
  setInterval(drawBest, 50)
  function drawBest() {
    genSpan.textContent = generation
    matchSpan.textContent = (100 * (1 - theBest.fitness / maxDiff)).toFixed(2)
    ctx.putImageData(theBest.imageData, 0, 0)
  }
  function iteration() {
    generation += 1
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

      // drawCircle(
      //   helpContext,
      //   color,
      //   getRandomInt(0, image.width),
      //   getRandomInt(0, image.height),
      //   getRandomFloat(1, 100)
      // )
      drawShape(
        helpContext,
        color,
        coords
      )
      const imgData = helpContext.getImageData(0, 0, image.width, image.height)
      news[i].imageData = imgData
      news[i].fitness = calcFitness(mainImageData.data, imgData.data)
    }
    const bests = [...findXBest(olds, 5), ...findXBest(news, 5)]
    bests.sort(sortFitness)
    theBest = bests[0]
    for (let i = 10; i < olds.length; i++) {
      olds[i].imageData = bests[i % 10].imageData
      olds[i].fitness = bests[i % 10].fitness
    }
    setTimeout(iteration, 0)
  }
}

function sortFitness(a, b) {
  return a.fitness - b.fitness
}

function findXBest(arr, x) {
  if (arr.length < x) throw new Error('Array length must be greater than x.')
  const bests = []
  const indexes = []
  for (let c = 0; c < x; c++) {  
    let min = { fitness: Number.MAX_SAFE_INTEGER }
    let minIndex = 0
    for (let i = 0; i < arr.length; i++) {
      if (indexes.includes(i)) continue
      if (arr[i].fitness < min.fitness) {
        min = arr[i]
        minIndex = i
      }
    }
    bests.push(min)
    indexes.push(minIndex)
  }
  return bests
}

function resizeCanvas(width, height) {
  canvas.width = helpCanvas.width = width
  canvas.height = helpCanvas.height = height
}

function getImageData(image) {
  helpCanvas.width = image.width
  helpCanvas.height = image.height
  helpContext.drawImage(image, 0, 0)
  const data = helpContext.getImageData(0, 0, image.width, image.height)
  helpContext.clearRect(0, 0, helpCanvas.width, helpCanvas.height)
  return data
}

function mutate(m, t) {
  const n = []
  for (let i = 0; i < m.length; i++) {
    n.push(Math.random() < 0.5 ? m[i] : t[i])
  }
  return n
}

function calcFitness(original, current) {
  let sum = 0
  for (let i = 0; i < original.length; i += 4) {
    sum += Math.abs(original[i] - current[i]) // red
      + Math.abs(original[i + 1] - current[i + 1]) // green
      + Math.abs(original[i + 2] - current[i + 2]) // blue
  }
  return sum
}

function drawCircle(ctx, color, x, y, radius) {
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, Math.PI * 2)
  ctx.closePath()
  ctx.fillStyle = color
  ctx.fill()
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