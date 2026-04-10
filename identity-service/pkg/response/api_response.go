package response

import "github.com/gin-gonic/gin"

// format api response
func Success(c *gin.Context, code int, message string, data interface{}) {
	c.JSON(code, gin.H{
		"success": true,
		"code":    code,
		"message": message,
		"data":    data,
	})
}

func Error(c *gin.Context, code int, message string) {
	c.JSON(code, gin.H{
		"success": false,
		"code":    code,
		"message": message,
		"data":    nil,
	})
}

type ErrorResponse struct {
	Success bool   `json:"success" example:"false"`
	Code    int    `json:"code" example:"400"`
	Message string `json:"message" example:"Chi tiết mô tả lỗi ở đây"`
	Data    any    `json:"data" swaggertype:"object"`
}

type SuccessResponse struct {
	Success bool   `json:"success" example:"true"`
	Code    int    `json:"code" example:"200"`
	Message string `json:"message" example:"Thao tác thành công"`
	Data    any    `json:"data"`
}
