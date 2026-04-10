package repository

import (
	"github.com/namdang-fdp/seal-copilot/identity-service/internal/database"
	"github.com/namdang-fdp/seal-copilot/identity-service/internal/models"
)

func GetRoleByName(roleName string) (*models.Role, error) {
	var role models.Role
	result := database.DB.Where("name = ?", roleName).First(&role)
	if result.Error != nil {
		return nil, result.Error
	}
	return &role, nil
}
