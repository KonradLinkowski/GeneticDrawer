const canvas = document.querySelector('#genetic-canvas')
const ctx = canvas.getContext('2d')
const image = document.querySelector('#genetic-image')

resizeCanvas(image.width, image.height)

getImageData(image)

function resizeCanvas(width, height) {
  canvas.width = width
  canvas.height = height
}

function getImageData(image) {
  ctx.drawImage(image, 0, 0)
  const data = ctx.getImageData(0, 0, image.width, image.height)
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  return data
}

function drawShape(color, coords) {
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