package logger

import (
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

var Log *zap.Logger

func InitLogger(env string) {
	var config zap.Config
	// config log level base on type of environment
	if env == "production" {
		config = zap.NewProductionConfig()
		config.EncoderConfig.EncodeTime = zapcore.ISO8601TimeEncoder
	} else {
		config = zap.NewDevelopmentConfig()
		config.EncoderConfig.EncodeLevel = zapcore.CapitalColorLevelEncoder
	}

	config.OutputPaths = []string{"stdout"}

	logger, err := config.Build()
	if err != nil {
		panic("Panic: Cannot init zap logger: " + err.Error())
	}
	Log = logger
	zap.ReplaceGlobals(logger)
	Log.Info("Zap Logger init successfully")
}
