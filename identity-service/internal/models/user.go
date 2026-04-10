package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type User struct {
	ID        uuid.UUID `gorm:"type:uuid;primary_key;" json:"id"`
	Username  string    `gorm:"type:varchar(100);uniqueIndex;not null" json:"username"`
	Password  string    `gorm:"type:varchar(255);not null" json:"-"`
	RoleID    uuid.UUID `gorm:"type:uuid;not null" json:"role_id"`
	Role      Role      `gorm:"foreignKey:RoleID" json:"role"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// gorm hook, run before insert data to db
func (u *User) BeforeCreate(tx *gorm.DB) (err error) {
	if u.ID == uuid.Nil {
		// new UUID
		u.ID = uuid.New()
	}
	return
}
