"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { X, Pen, Palette, Sticker, Tag, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface PhotoEditModalProps {
  isOpen: boolean
  onClose: () => void
  imageUrl: string
  username: string
  userAvatar: string
}

interface DroppedItem {
  id: string
  type: "sticker" | "tag"
  content: string
  x: number
  y: number
  avatar?: string
}

const stickers = ["😀", "😂", "❤️", "🔥", "👍", "🎉", "✨", "💯", "🌟", "💕", "😍", "🥳"]

const tags = [
  { name: "john_doe", avatar: "/male-user-profile.jpg" },
  { name: "jane_smith", avatar: "/female-user-profile.png" },
  { name: "mike_wilson", avatar: "/male-user-avatar.png" },
  { name: "sarah_jones", avatar: "/female-user-avatar.png" },
  { name: "alex_brown", avatar: "/diverse-user-profiles.png" },
]

export function PhotoEditModal({ isOpen, onClose, imageUrl, username, userAvatar }: PhotoEditModalProps) {
  const [selectedColor, setSelectedColor] = useState("#ff0000")
  const [isDrawing, setIsDrawing] = useState(false)
  const [droppedItems, setDroppedItems] = useState<DroppedItem[]>([])
  const [draggedItem, setDraggedItem] = useState<DroppedItem | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const colors = ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#00ffff", "#ffffff", "#000000"]

  useEffect(() => {
    if (!isOpen) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const img = new Image()
    img.crossOrigin = "anonymous"
    img.src = imageUrl
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)
    }
  }, [isOpen, imageUrl])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left) * (canvas.width / rect.width)
    const y = (e.clientY - rect.top) * (canvas.height / rect.height)

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.strokeStyle = selectedColor
    ctx.lineWidth = 3
    ctx.lineCap = "round"
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left) * (canvas.width / rect.width)
    const y = (e.clientY - rect.top) * (canvas.height / rect.height)

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (!draggedItem || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setDroppedItems([
      ...droppedItems,
      {
        ...draggedItem,
        x,
        y,
      },
    ])
    setDraggedItem(null)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 dark:bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-background border border-border rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Edit Photo</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-muted">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Image Area */}
          <div
            ref={containerRef}
            className="flex-1 relative bg-muted flex items-center justify-center overflow-hidden"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <canvas
              ref={canvasRef}
              className="max-w-full max-h-full"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
            />
            {droppedItems.map((item) => (
              <div key={item.id} className="absolute pointer-events-none" style={{ left: item.x, top: item.y }}>
                {item.type === "sticker" ? (
                  <span className="text-4xl">{item.content}</span>
                ) : (
                  <div className="bg-blue-500 text-white px-2 py-1 rounded-full text-sm flex items-center gap-1">
                    {item.avatar && (
                      <Avatar className="w-4 h-4">
                        <AvatarImage src={item.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{item.content[0]}</AvatarFallback>
                      </Avatar>
                    )}
                    @{item.content}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right Toolbar */}
          <div className="w-16 bg-background border-l border-border flex flex-col items-center gap-4 py-4">
            <Button variant="ghost" size="icon" className="hover:bg-muted" title="Draw">
              <Pen className="w-5 h-5 scale-150" />
            </Button>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-muted" title="Color">
                  <Palette className="w-5 h-5 scale-150" />
                </Button>
              </PopoverTrigger>
              <PopoverContent side="left" className="w-auto p-2 bg-card border-border">
                <div className="grid grid-cols-4 gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      className="w-8 h-8 rounded-full border-2 border-border hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      onClick={() => setSelectedColor(color)}
                    />
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-muted" title="Stickers">
                  <Sticker className="w-5 h-5 scale-150" />
                </Button>
              </PopoverTrigger>
              <PopoverContent side="left" className="w-64 p-2 bg-card border-border">
                <div className="grid grid-cols-6 gap-2">
                  {stickers.map((sticker, index) => (
                    <button
                      key={index}
                      className="text-3xl hover:scale-110 transition-transform cursor-move"
                      draggable
                      onDragStart={() =>
                        setDraggedItem({
                          id: `sticker-${Date.now()}`,
                          type: "sticker",
                          content: sticker,
                          x: 0,
                          y: 0,
                        })
                      }
                    >
                      {sticker}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-muted" title="Tags">
                  <Tag className="w-5 h-5 scale-150" />
                </Button>
              </PopoverTrigger>
              <PopoverContent side="left" className="w-48 p-2 bg-card border-border">
                <div className="flex flex-col gap-1">
                  {tags.map((tag, index) => (
                    <button
                      key={index}
                      className="flex items-center gap-2 px-2 py-1 hover:bg-muted rounded cursor-move text-foreground"
                      draggable
                      onDragStart={() =>
                        setDraggedItem({
                          id: `tag-${Date.now()}`,
                          type: "tag",
                          content: tag.name,
                          avatar: tag.avatar,
                          x: 0,
                          y: 0,
                        })
                      }
                    >
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={tag.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{tag.name[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{tag.name}</span>
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Bottom Message Bar */}
        <div className="border-t border-border px-4 py-3">
          <div className="flex items-center gap-3 bg-muted rounded-full px-4 py-3">
            <input
              type="text"
              placeholder="Send message..."
              className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none text-foreground"
            />
            <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-4">
              <Send className="w-4 h-4 mr-1" />
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
