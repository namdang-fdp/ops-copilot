package main

import (
	"fmt"

	"github.com/namdang-fdp/seal-copilot/identity-service/internal/api"
	"github.com/namdang-fdp/seal-copilot/identity-service/internal/config"
	"github.com/namdang-fdp/seal-copilot/identity-service/internal/database"
	"github.com/namdang-fdp/seal-copilot/identity-service/pkg/logger"
)

// @title           SEAL Copilot Identity API
// @version         1.0
// @description     API Documentation for Identity Microservice.
// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
func main() {
	// Load config (env...)
	config.LoadConfig()

	// load logger depend on env
	logger.InitLogger(config.Cfg.AppEnv)

	// flush all log before shut down app
	defer logger.Log.Sync()

	// connect to database
	database.ConnectDB()

	// setup router
	r := api.SetupRouter()

	logger.Log.Info(fmt.Sprintf("Starting [%s] at port [%s]", config.Cfg.AppName, config.Cfg.AppPort))

	r.Run(":" + config.Cfg.AppPort)
}
