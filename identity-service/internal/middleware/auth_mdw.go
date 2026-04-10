package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/namdang-fdp/seal-copilot/identity-service/internal/config"
	"github.com/namdang-fdp/seal-copilot/identity-service/pkg/response"
)

func RequireAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			response.Error(c, http.StatusUnauthorized, "Missing or invalid token")
			c.Abort()
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")

		// parse token
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			return []byte(config.Cfg.JWTSecret), nil
		})

		if err != nil || !token.Valid {
			response.Error(c, http.StatusUnauthorized, "Token expired or invalid")
			c.Abort()
			return
		}

		// if token valid, go to gin context
		if claims, ok := token.Claims.(jwt.MapClaims); ok {
			c.Set("userID", claims["sub"])
			c.Set("role", claims["role"])
			c.Next()
		} else {
			response.Error(c, http.StatusUnauthorized, "Invalid token claims")
			c.Abort()
		}
	}
}
