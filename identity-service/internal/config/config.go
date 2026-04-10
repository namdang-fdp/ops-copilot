package config

import (
	"log"

	"github.com/spf13/viper"
)

type AppConfig struct {
	AppName    string `mapstructure:"APP_NAME"`
	AppPort    string `mapstructure:"APP_PORT"`
	AppEnv     string `mapstructure:"APP_ENV"`
	DBHost     string `mapstructure:"DB_HOST"`
	DBPort     string `mapstructure:"DB_PORT"`
	DBUser     string `mapstructure:"DB_USER"`
	DBPassword string `mapstructure:"DB_PASSWORD"`
	DBName     string `mapstructure:"DB_NAME"`
	DBSSLMode  string `mapstructure:"DB_SSLMODE"`
	JWTSecret  string `mapstructure:"JWT_SECRET"`
}

var Cfg AppConfig

func LoadConfig() {
	viper.SetConfigFile(".env")
	viper.AutomaticEnv()

	if err := viper.ReadInConfig(); err != nil {
		log.Fatalf("Panic: Cannot find the config file (.env): %v", err)
	}

	if err := viper.Unmarshal(&Cfg); err != nil {
		log.Fatalf("Panic: Cannot map the config into struct: %v", err)
	}
}
