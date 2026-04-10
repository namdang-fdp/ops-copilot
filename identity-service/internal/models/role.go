package models

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Role struct {
	ID          uuid.UUID `gorm:"type:uuid;primary_key;" json:"id"`
	Name        string    `gorm:"type:varchar(50);uniqueIndex;not null" json:"name"`
	Description string    `gorm:"type:varchar(255)" json:"description"`
}

func (r *Role) BeforeCreate(tx *gorm.DB) (err error) {
	if r.ID == uuid.Nil {
		r.ID = uuid.New()
	}
	return
}
