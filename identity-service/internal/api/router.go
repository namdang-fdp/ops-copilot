package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/namdang-fdp/seal-copilot/identity-service/internal/handlers"
	"github.com/namdang-fdp/seal-copilot/identity-service/internal/middleware"
)

const scalarHTML = `
<!DOCTYPE html>
<html>
<head>
    <title>SEAL Copilot API Docs</title>
    <meta charset="utf-8" />
</head>
<body>
    <script id="api-reference" data-url="/docs/swagger.json"></script>
    <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
</body>
</html>
`

func SetupRouter() *gin.Engine {
	gin.SetMode(gin.ReleaseMode)
	r := gin.New()
	r.Use(gin.Recovery())

	r.StaticFile("/docs/swagger.json", "./docs/swagger.json")

	r.GET("/docs", func(c *gin.Context) {
		c.Data(http.StatusOK, "text/html; charset=utf-8", []byte(scalarHTML))
	})

	api := r.Group("/api/auth")
	{
		api.POST("/register", handlers.RegisterHandler)
		api.POST("/login", handlers.LoginHandler)
	}

	protected := r.Group("/api/auth")
	protected.Use(middleware.RequireAuth())
	{
		protected.GET("/me", handlers.GetMe)
	}

	return r
}
