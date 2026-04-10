package service

import (
	"net/http"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/namdang-fdp/seal-copilot/identity-service/internal/config"
	"github.com/namdang-fdp/seal-copilot/identity-service/internal/dto/res"
	"github.com/namdang-fdp/seal-copilot/identity-service/internal/models"
	"github.com/namdang-fdp/seal-copilot/identity-service/internal/repository"
	"github.com/namdang-fdp/seal-copilot/identity-service/pkg/response"
	"golang.org/x/crypto/bcrypt"
)

func Register(username, password, roleName string) error {
	role, err := repository.GetRoleByName(roleName)
	if err != nil {
		return response.NewAppError(http.StatusNotFound, "Role không tồn tại trong hệ thống")
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return response.NewAppError(http.StatusInternalServerError, "Lỗi mã hóa mật khẩu")
	}

	user := &models.User{
		Username: username,
		Password: string(hashedPassword),
		RoleID:   role.ID,
	}

	err = repository.CreateUser(user)
	if err != nil {
		return response.NewAppError(http.StatusConflict, "Username đã tồn tại")
	}

	return nil
}

func Login(username, password string) (string, error) {
	user, err := repository.GetUserByUsername(username)
	if err != nil {
		return "", response.NewAppError(http.StatusUnauthorized, "Sai tài khoản hoặc mật khẩu")
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
	if err != nil {
		return "", response.NewAppError(http.StatusUnauthorized, "Sai tài khoản hoặc mật khẩu")
	}

	claims := jwt.MapClaims{
		"sub":  user.ID.String(),
		"role": user.Role.Name,
		"exp":  time.Now().Add(time.Hour * 24).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(config.Cfg.JWTSecret))
	if err != nil {
		return "", response.NewAppError(http.StatusInternalServerError, "Không thể tạo token")
	}

	return tokenString, nil
}

func GetMe(userID string) (*res.UserResponse, error) {
	user, err := repository.GetUserByID(userID)
	if err != nil {
		return nil, response.NewAppError(http.StatusNotFound, "Người dùng không tồn tại")
	}

	return &res.UserResponse{
		ID:       user.ID.String(),
		Username: user.Username,
		Role:     user.Role.Name,
	}, nil
}
