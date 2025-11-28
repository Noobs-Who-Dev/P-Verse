"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Upload, Send, CheckCircle } from "lucide-react"
import { useI18n } from "@/lib/i18n/I18nContext"
import { useToast } from "@/hooks/use-toast"
import { supportService } from "@/lib/services/supportService"

interface ReportProblemModalProps {
  isOpen: boolean
  onClose: () => void
}

type ProblemType = "bug" | "feature" | "account" | "content" | "other"

export function ReportProblemModal({ isOpen, onClose }: ReportProblemModalProps) {
  const { t, language } = useI18n()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const [formData, setFormData] = useState({
    type: "" as ProblemType | "",
    subject: "",
    description: "",
    screenshot: null as File | null
  })

  const problemTypes = [
    { value: "bug", label: language === 'vi' ? "Lỗi kỹ thuật" : "Bug/Technical Issue" },
    { value: "feature", label: language === 'vi' ? "Đề xuất tính năng" : "Feature Request" },
    { value: "account", label: language === 'vi' ? "Vấn đề tài khoản" : "Account Issue" },
    { value: "content", label: language === 'vi' ? "Nội dung không phù hợp" : "Inappropriate Content" },
    { value: "other", label: language === 'vi' ? "Khác" : "Other" }
  ]

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: language === 'vi' ? "Lỗi" : "Error",
          description: language === 'vi' ? "File quá lớn. Tối đa 5MB" : "File too large. Maximum 5MB",
          variant: "destructive"
        })
        return
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: language === 'vi' ? "Lỗi" : "Error",
          description: language === 'vi' ? "Chỉ chấp nhận file ảnh" : "Only image files are allowed",
          variant: "destructive"
        })
        return
      }

      setFormData(prev => ({ ...prev, screenshot: file }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.type) {
      toast({
        title: language === 'vi' ? "Lỗi" : "Error",
        description: language === 'vi' ? "Vui lòng chọn loại vấn đề" : "Please select problem type",
        variant: "destructive"
      })
      return
    }

    if (!formData.subject.trim()) {
      toast({
        title: language === 'vi' ? "Lỗi" : "Error",
        description: language === 'vi' ? "Vui lòng nhập tiêu đề" : "Please enter subject",
        variant: "destructive"
      })
      return
    }

    if (!formData.description.trim()) {
      toast({
        title: language === 'vi' ? "Lỗi" : "Error",
        description: language === 'vi' ? "Vui lòng mô tả vấn đề" : "Please describe the problem",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Call real API - Always use JSON endpoint for now
      // TODO: Implement file upload separately if needed
      await supportService.submitReport({
        type: formData.type,
        subject: formData.subject,
        description: formData.description
      })

      setIsSuccess(true)

      toast({
        title: language === 'vi' ? "Thành công" : "Success",
        description: language === 'vi'
          ? "Báo cáo của bạn đã được gửi. Chúng tôi sẽ xem xét và phản hồi sớm nhất."
          : "Your report has been submitted. We'll review and respond as soon as possible."
      })

      // Reset form after 2 seconds
      setTimeout(() => {
        setFormData({
          type: "",
          subject: "",
          description: "",
          screenshot: null
        })
        setIsSuccess(false)
        onClose()
      }, 2000)

    } catch (error: any) {
      console.error("Failed to submit report:", error)
      console.error("Error details:", error.response?.data)
      toast({
        title: language === 'vi' ? "Lỗi" : "Error",
        description: error.response?.data?.message || (language === 'vi'
          ? "Không thể gửi báo cáo. Vui lòng thử lại."
          : "Failed to submit report. Please try again."),
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        type: "",
        subject: "",
        description: "",
        screenshot: null
      })
      setIsSuccess(false)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">
            {t('reportProblem')}
          </DialogTitle>
          <DialogDescription>
            {language === 'vi'
              ? "Hãy cho chúng tôi biết vấn đề bạn đang gặp phải. Chúng tôi sẽ xem xét và giải quyết sớm nhất có thể."
              : "Let us know what problem you're experiencing. We'll review and address it as soon as possible."}
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="py-8 text-center">
            <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {language === 'vi' ? "Đã gửi báo cáo!" : "Report Submitted!"}
            </h3>
            <p className="text-muted-foreground">
              {language === 'vi'
                ? "Cảm ơn bạn đã phản hồi. Chúng tôi sẽ liên hệ sớm."
                : "Thank you for your feedback. We'll be in touch soon."}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Problem Type */}
            <div className="space-y-2">
              <Label htmlFor="problem-type">
                {language === 'vi' ? "Loại vấn đề" : "Problem Type"} *
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as ProblemType }))}
              >
                <SelectTrigger id="problem-type">
                  <SelectValue placeholder={language === 'vi' ? "Chọn loại vấn đề" : "Select problem type"} />
                </SelectTrigger>
                <SelectContent>
                  {problemTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <Label htmlFor="subject">
                {language === 'vi' ? "Tiêu đề" : "Subject"} *
              </Label>
              <Input
                id="subject"
                placeholder={language === 'vi' ? "Tóm tắt vấn đề trong một dòng" : "Summarize the problem in one line"}
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                maxLength={100}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">
                {language === 'vi' ? "Mô tả chi tiết" : "Detailed Description"} *
              </Label>
              <Textarea
                id="description"
                placeholder={language === 'vi'
                  ? "Mô tả chi tiết vấn đề, các bước để tái hiện lỗi, hoặc đề xuất của bạn..."
                  : "Describe the problem in detail, steps to reproduce, or your suggestion..."}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={5}
                maxLength={1000}
              />
              <p className="text-xs text-muted-foreground">
                {formData.description.length}/1000
              </p>
            </div>

            {/* Screenshot Upload */}
            <div className="space-y-2">
              <Label htmlFor="screenshot">
                {language === 'vi' ? "Ảnh chụp màn hình (tùy chọn)" : "Screenshot (optional)"}
              </Label>
              <div className="border-2 border-dashed rounded-lg p-4 text-center hover:border-primary transition-colors">
                <input
                  type="file"
                  id="screenshot"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="screenshot" className="cursor-pointer">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  {formData.screenshot ? (
                    <p className="text-sm font-medium">{formData.screenshot.name}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {language === 'vi' ? "Click để tải ảnh lên (Tối đa 5MB)" : "Click to upload image (Max 5MB)"}
                    </p>
                  )}
                </label>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    {language === 'vi' ? "Đang gửi..." : "Submitting..."}
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    {language === 'vi' ? "Gửi báo cáo" : "Submit Report"}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

