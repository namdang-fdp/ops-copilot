package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/namdang-fdp/seal-copilot/identity-service/internal/dto/req"
	"github.com/namdang-fdp/seal-copilot/identity-service/internal/dto/res"
	"github.com/namdang-fdp/seal-copilot/identity-service/internal/service"
	"github.com/namdang-fdp/seal-copilot/identity-service/pkg/response"
)

// RegisterHandler godoc
// @Summary      Register a new user
// @Description  Create a new user with a specific role
// @Tags         Authentication
// @Accept       json
// @Produce      json
// @Param        request body req.RegisterRequest true "Registration Info"
// @Success      201  {object}  response.SuccessResponse "Thành công"
// @Failure      400  {object}  response.ErrorResponse "Thiếu trường hoặc sai định dạng JSON"
// @Failure      404  {object}  response.ErrorResponse "Không tìm thấy Role"
// @Failure      409  {object}  response.ErrorResponse "Username đã tồn tại"
// @Failure      500  {object}  response.ErrorResponse "Lỗi server nội bộ"
// @Router       /api/auth/register [post]
func RegisterHandler(c *gin.Context) {
	var payload req.RegisterRequest
	if err := c.ShouldBindJSON(&payload); err != nil {
		response.Error(c, http.StatusBadRequest, "Dữ liệu không hợp lệ")
		return
	}

	err := service.Register(payload.Username, payload.Password, payload.RoleName)
	if err != nil {
		if appErr, ok := err.(*response.AppError); ok {
			response.Error(c, appErr.StatusCode, appErr.Message)
		} else {
			response.Error(c, http.StatusInternalServerError, "Lỗi máy chủ nội bộ")
		}
		return
	}

	response.Success(c, http.StatusCreated, "Đăng ký thành công", nil)
}

// LoginHandler godoc
// @Summary      Login user
// @Description  Authenticate user and return JWT Access Token
// @Tags         Authentication
// @Accept       json
// @Produce      json
// @Param        request body req.LoginRequest true "Login Credentials"
// @Success      200  {object}  res.LoginResponse "Đăng nhập thành công"
// @Failure      400  {object}  response.ErrorResponse "Thiếu trường hoặc sai định dạng JSON"
// @Failure      401  {object}  response.ErrorResponse "Sai tài khoản hoặc mật khẩu"
// @Failure      500  {object}  response.ErrorResponse "Lỗi server nội bộ"
// @Router       /api/auth/login [post]
func LoginHandler(c *gin.Context) {
	var payload req.LoginRequest
	if err := c.ShouldBindJSON(&payload); err != nil {
		response.Error(c, http.StatusBadRequest, "Dữ liệu không hợp lệ")
		return
	}

	token, err := service.Login(payload.Username, payload.Password)
	if err != nil {
		if appErr, ok := err.(*response.AppError); ok {
			response.Error(c, appErr.StatusCode, appErr.Message)
		} else {
			response.Error(c, http.StatusInternalServerError, "Lỗi máy chủ nội bộ")
		}
		return
	}

	response.Success(c, http.StatusOK, "Đăng nhập thành công", res.LoginResponse{
		AccessToken: token,
	})
}

// GetMe godoc
// @Summary      Get current user info
// @Description  Get information of the currently logged-in user
// @Tags         Authentication
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Success      200  {object}  res.UserResponse "Thành công"
// @Failure      401  {object}  response.ErrorResponse "Chưa xác thực"
// @Failure      404  {object}  response.ErrorResponse "Không tìm thấy user"
// @Failure      500  {object}  response.ErrorResponse "Lỗi server nội bộ"
// @Router       /api/auth/me [get]
func GetMe(c *gin.Context) {
	// get user id from middleware
	userIDRaw, exists := c.Get("userID")
	if !exists {
		response.Error(c, http.StatusUnauthorized, "Chưa xác thực")
		return
	}

	userID, ok := userIDRaw.(string)
	if !ok {
		response.Error(c, http.StatusUnauthorized, "Token không hợp lệ")
		return
	}

	userInfo, err := service.GetMe(userID)
	if err != nil {
		if appErr, ok := err.(*response.AppError); ok {
			response.Error(c, appErr.StatusCode, appErr.Message)
		} else {
			response.Error(c, http.StatusInternalServerError, "Lỗi máy chủ nội bộ")
		}
		return
	}

	response.Success(c, http.StatusOK, "Thông tin user", userInfo)
}
