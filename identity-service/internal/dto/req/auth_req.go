package req

type LoginRequest struct {
	Username string `json:"username" binding:"required" example:"admin"`
	Password string `json:"password" binding:"required" example:"123456"`
}

type RegisterRequest struct {
	Username string `json:"username" binding:"required" example:"ops_namdang"`
	Password string `json:"password" binding:"required,min=6" example:"secret123"`
	RoleName string `json:"role_name" binding:"required" example:"admin"`
}
