package repository

import (
	"github.com/namdang-fdp/seal-copilot/identity-service/internal/database"
	"github.com/namdang-fdp/seal-copilot/identity-service/internal/models"
)

func CreateUser(user *models.User) error {
	result := database.DB.Create(user)
	return result.Error
}

func GetUserByUsername(username string) (*models.User, error) {
	var user models.User
	result := database.DB.Joins("Role").Where("username = ?", username).First(&user)

	if result.Error != nil {
		return nil, result.Error
	}
	return &user, nil
}

func GetUserByID(id string) (*models.User, error) {
	var user models.User
	result := database.DB.Joins("Role").Where("users.id = ?", id).First(&user)
	if result.Error != nil {
		return nil, result.Error
	}
	return &user, nil
}
