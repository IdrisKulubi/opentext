import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { TextElement, PathPoint } from "@/lib/context/text-context"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper function to calculate distance between two points
export const distance = (p1: PathPoint, p2: PathPoint): number => {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2))
}

// Generate SVG path data from points
export const generatePathD = (points: PathPoint[], closed: boolean): string => {
  if (points.length < 1) return ''
  
  let d = `M ${points[0].x} ${points[0].y}`
  
  for (let i = 1; i < points.length; i++) {
    d += ` L ${points[i].x} ${points[i].y}`
  }
  
  if (closed && points.length > 1) {
    d += ' Z' // Close the path
  }
  
  return d
}

// Calculate the length of a path
export const getPathLength = (path: PathPoint[], closed: boolean): number => {
  if (path.length <= 1) return 0
  
  let length = 0
  for (let i = 0; i < path.length - 1; i++) {
    length += distance(path[i], path[i + 1])
  }
  
  if (closed && path.length > 1) {
    length += distance(path[path.length - 1], path[0])
  }
  
  return length
}

// Get repeated text content for path
export const getTextPathContent = (
  text: string, 
  fontSize: number, 
  path: PathPoint[], 
  pathClosed: boolean, 
  spaceBetween: number
): string => {
  const words = text.trim().split(/\s+/); // Split text into words
  if (words.length === 0) return ''

  if (path.length < 2) return text

  const pathLength = getPathLength(path, pathClosed)
  if (pathLength === 0) return text

  const avgCharWidth = fontSize * 0.6
  const sequenceWidth = words.reduce((sum, word) => sum + word.length * avgCharWidth, 0) 
                        + Math.max(0, words.length - 1) * spaceBetween

  const numRepetitions = Math.max(1, Math.floor(pathLength / (sequenceWidth + spaceBetween)))
  
  // Build the final string with repeated words
  let content = ''
  for (let i = 0; i < numRepetitions; i++) {
    content += words.join(' ') + ' ' // Add space after each sequence
  }
  return content.trim()
}

// Function to render the canvas with all text elements to a data URL
export const renderCanvasToDataURL = async (
  imageSrc: string,
  textElements: TextElement[],
  format: 'image/png' | 'image/jpeg' = 'image/png',
  quality: number = 0.9
): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Create a temporary image to get dimensions
    const img = new Image()
    img.crossOrigin = "anonymous"
    
    img.onload = () => {
      // Create canvas with the same dimensions as the image
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      if (!ctx) {
        reject(new Error('Failed to get canvas context'))
        return
      }
      
      // Set canvas dimensions to match the image
      canvas.width = img.width
      canvas.height = img.height
      
      // Draw the image first
      ctx.drawImage(img, 0, 0, img.width, img.height)
      
      // Sort text elements by z-index to render in the correct order
      const sortedTextElements = [...textElements].sort((a, b) => a.zIndex - b.zIndex)
      
      // Draw each text element
      sortedTextElements.forEach(textElement => {
        // Set text styles
        ctx.font = `${textElement.isItalic ? 'italic' : 'normal'} ${textElement.fontWeight} ${textElement.fontSize}px ${textElement.fontFamily}`
        ctx.fillStyle = textElement.color
        ctx.textAlign = textElement.textAlign === 'left' ? 'left' : 
                        textElement.textAlign === 'right' ? 'right' : 'center'
        
        // Handle text decoration if needed
        const hasDecoration = textElement.isUnderlined
        
        if (textElement.path.length >= 2) {
          // For path-based text, we need to use a more complex approach
          renderPathText(ctx, textElement)
        } else {
          // For regular or repeated text
          const repetitionCount = textElement.isRepeating ? textElement.repetitionCount : 1
          let rows = 1
          let cols = 1
          
          if (textElement.repetitionDirection === "horizontal") {
            cols = repetitionCount
          } else if (textElement.repetitionDirection === "vertical") {
            rows = repetitionCount
          } else if (textElement.repetitionDirection === "both") {
            rows = Math.ceil(Math.sqrt(repetitionCount))
            cols = Math.ceil(repetitionCount / rows)
          }
          
          const baseX = textElement.position.x
          const baseY = textElement.position.y
          
          for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
              if (row * cols + col >= repetitionCount) break
              
              const xOffset = col * textElement.horizontalSpacing
              const yOffset = row * textElement.verticalSpacing
              
              const x = baseX + xOffset
              const y = baseY + yOffset
              
              ctx.fillText(textElement.text, x, y)
              
              // Add underline if needed
              if (hasDecoration) {
                const textMetrics = ctx.measureText(textElement.text)
                const textWidth = textMetrics.width
                
                if (textElement.isUnderlined) {
                  ctx.beginPath()
                  let underlineY = y + 3 // Offset for underline
                  let underlineStartX = x
                  
                  // Adjust underline position based on text alignment
                  if (textElement.textAlign === 'center') {
                    underlineStartX -= textWidth / 2
                  } else if (textElement.textAlign === 'right') {
                    underlineStartX -= textWidth
                  }
                  
                  ctx.moveTo(underlineStartX, underlineY)
                  ctx.lineTo(underlineStartX + textWidth, underlineY)
                  ctx.strokeStyle = textElement.color
                  ctx.lineWidth = Math.max(1, textElement.fontSize / 20) // Scale line width with font size
                  ctx.stroke()
                }
              }
            }
          }
        }
      })
      
      // Convert canvas to data URL with specified format and quality
      try {
        const dataURL = canvas.toDataURL(format, quality)
        resolve(dataURL)
      } catch (err) {
        reject(new Error('Failed to create data URL: ' + err))
      }
    }
    
    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }
    
    img.src = imageSrc
  })
}

// Helper function to render text along a path
const renderPathText = (ctx: CanvasRenderingContext2D, textElement: TextElement) => {
  const { path, text, fontSize, fontFamily, fontWeight, isItalic, color, pathClosed, spaceBetween } = textElement
  
  if (path.length < 2) return
  
  // Get the text content with repetitions
  const textContent = getTextPathContent(text, fontSize, path, pathClosed, spaceBetween)
  
  // Split into characters for rendering along path
  const chars = textContent.split('')
  
  // Calculate total path length
  const pathLength = getPathLength(path, pathClosed)
  
  // Calculate character spacing
  const totalTextLength = chars.length * fontSize * 0.6 // Approximate width
  const charSpacing = pathLength / totalTextLength
  
  // Save the current context state
  ctx.save()
  
  // Set text properties
  ctx.font = `${isItalic ? 'italic' : 'normal'} ${fontWeight} ${fontSize}px ${fontFamily}`
  ctx.fillStyle = color
  
  // Current distance traveled along the path
  let distanceTraveled = 0
  
  for (let i = 0; i < chars.length; i++) {
    const char = chars[i]
    
    // Calculate position along the path
    const pathPosition = getPositionAlongPath(path, distanceTraveled / pathLength, pathClosed)
    
    if (pathPosition) {
      const { x, y, angle } = pathPosition
      
      // Save context state before rotating
      ctx.save()
      
      // Translate to the point on the path
      ctx.translate(x, y)
      
      // Rotate text to follow path tangent
      ctx.rotate(angle)
      
      // Draw character centered at this point
      ctx.fillText(char, 0, 0)
      
      // Restore context
      ctx.restore()
    }
    
    // Increment distance traveled
    distanceTraveled += fontSize * 0.6 * charSpacing
    
    // If we've gone past the path length and it's not closed, stop drawing
    if (distanceTraveled > pathLength && !pathClosed) break
  }
  
  // Restore the context to its original state
  ctx.restore()
}

// Calculate position and angle at a given point along the path
const getPositionAlongPath = (
  path: PathPoint[], 
  percentage: number, 
  closed: boolean
): { x: number, y: number, angle: number } | null => {
  if (path.length < 2) return null
  
  // Handle percentage exceeding 1 for closed paths
  if (percentage > 1) {
    if (closed) {
      percentage = percentage % 1
    } else {
      percentage = 1
    }
  }
  
  // Calculate total path length
  const totalLength = getPathLength(path, closed)
  const targetDistance = totalLength * percentage
  
  // Find the segment where our target point lies
  let distanceSoFar = 0
  
  for (let i = 0; i < path.length - 1; i++) {
    const currentPoint = path[i]
    const nextPoint = path[i + 1]
    const segmentLength = distance(currentPoint, nextPoint)
    
    if (distanceSoFar + segmentLength >= targetDistance) {
      // Calculate how far along this segment our point is
      const segmentPercentage = (targetDistance - distanceSoFar) / segmentLength
      
      // Calculate position by interpolating between points
      const x = currentPoint.x + (nextPoint.x - currentPoint.x) * segmentPercentage
      const y = currentPoint.y + (nextPoint.y - currentPoint.y) * segmentPercentage
      
      // Calculate angle (tangent) of the path at this point
      const angle = Math.atan2(nextPoint.y - currentPoint.y, nextPoint.x - currentPoint.x)
      
      return { x, y, angle }
    }
    
    distanceSoFar += segmentLength
  }
  
  // If we're here and it's a closed path, connect back to the start
  if (closed && path.length > 1) {
    const currentPoint = path[path.length - 1]
    const nextPoint = path[0]
    const segmentLength = distance(currentPoint, nextPoint)
    
    if (distanceSoFar + segmentLength >= targetDistance) {
      const segmentPercentage = (targetDistance - distanceSoFar) / segmentLength
      
      const x = currentPoint.x + (nextPoint.x - currentPoint.x) * segmentPercentage
      const y = currentPoint.y + (nextPoint.y - currentPoint.y) * segmentPercentage
      
      const angle = Math.atan2(nextPoint.y - currentPoint.y, nextPoint.x - currentPoint.x)
      
      return { x, y, angle }
    }
  }
  
  // Fallback: return the last point
  const lastPoint = path[path.length - 1]
  const prevPoint = path[path.length - 2]
  const angle = Math.atan2(lastPoint.y - prevPoint.y, lastPoint.x - prevPoint.x)
  
  return { x: lastPoint.x, y: lastPoint.y, angle }
}

// Helper function to copy an image to clipboard
export const copyImageToClipboard = async (dataUrl: string): Promise<boolean> => {
  try {
    // Convert data URL to blob
    const res = await fetch(dataUrl)
    const blob = await res.blob()
    
    // Check if the Clipboard API supports writing blobs
    if (navigator.clipboard && navigator.clipboard.write) {
      const data = [new ClipboardItem({ [blob.type]: blob })]
      await navigator.clipboard.write(data)
      return true
    } else {
      // Fallback for browsers that don't support clipboard.write
      const img = document.createElement('img')
      img.src = dataUrl
      
      // Create a contenteditable div
      const div = document.createElement('div')
      div.contentEditable = 'true'
      div.style.position = 'fixed'
      div.style.opacity = '0'
      document.body.appendChild(div)
      
      // Add the image to the div
      div.appendChild(img)
      
      // Select the div content
      const range = document.createRange()
      range.selectNodeContents(div)
      
      const selection = window.getSelection()
      if (selection) {
        selection.removeAllRanges()
        selection.addRange(range)
        
        // Execute copy command
        const successful = document.execCommand('copy')
        
        // Clean up
        selection.removeAllRanges()
        document.body.removeChild(div)
        
        return successful
      }
      
      // Clean up if selection fails
      document.body.removeChild(div)
      return false
    }
  } catch (error) {
    console.error('Failed to copy image to clipboard:', error)
    return false
  }
}

// Generate a unique filename based on current timestamp
export const generateFilename = (format: 'png' | 'jpeg', prefix: string = 'text-overlay'): string => {
  const timestamp = new Date().toISOString().replace(/[-:.]/g, '').substring(0, 14)
  return `${prefix}-${timestamp}.${format}`
}

// Download a data URL as a file
export const downloadDataUrl = (dataUrl: string, filename: string): void => {
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Create a shareable link (for demo purposes, this creates a local storage entry)
export const createShareableLink = async (
  imageSrc: string,
  textElements: TextElement[],
  quality: number = 0.7
): Promise<string> => {
  // For a real app, you would upload to a server and get a link
  // Here we're doing a simplified version using localStorage
  try {
    // Create a smaller version of the image to save space
    const dataUrl = await renderCanvasToDataURL(imageSrc, textElements, 'image/jpeg', quality)
    
    // Generate a unique ID
    const shareId = `share-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    
    // Store in localStorage (in a real app, this would be server-side)
    localStorage.setItem(shareId, dataUrl)
    
    // Generate a "share link" (in a real app, this would be a real URL)
    // For demo purposes, we'll use a URL with a query parameter
    const shareLink = `${window.location.origin}?share=${shareId}`
    
    return shareLink
  } catch (error) {
    console.error('Error creating shareable link:', error)
    throw new Error('Failed to create shareable link')
  }
}
