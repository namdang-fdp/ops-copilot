package database

import (
	"github.com/namdang-fdp/seal-copilot/identity-service/internal/models"
	"github.com/namdang-fdp/seal-copilot/identity-service/pkg/logger"
	"go.uber.org/zap"
)

func SeedData() {
	roles := []models.Role{
		{Name: "admin", Description: "Quản trị viên toàn quyền (SysAdmin)"},
		{Name: "viewer", Description: "Chỉ được xem log, không được chạy runbook"},
	}

	for _, role := range roles {
		// skip if having yet, if not --> create
		err := DB.Where(models.Role{Name: role.Name}).FirstOrCreate(&role).Error
		if err != nil {
			logger.Log.Error("Error when seed role", zap.String("role", role.Name), zap.Error(err))
		}
	}

	logger.Log.Info("Seed role successfully!")
}
