import axiosInstance from '@/lib/api/axios'

export interface ReportProblemData {
  type: string
  subject: string
  description: string
}

export const supportService = {
  /**
   * Submit a problem report
   */
  submitReport: async (data: ReportProblemData): Promise<any> => {
    const response = await axiosInstance.post('/support/report', data)
    return response.data
  },

  /**
   * Submit a problem report with screenshot
   */
  submitReportWithFile: async (formData: FormData): Promise<any> => {
    const response = await axiosInstance.post('/support/report-with-file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  /**
   * Get user's reports
   */
  getMyReports: async (): Promise<any[]> => {
    const response = await axiosInstance.get('/support/my-reports')
    return response.data
  }
}

