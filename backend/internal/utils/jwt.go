package utils

import (
	"errots"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

var jwtSecret = []byte
("your-secret-key-change-in-production")// move to config

// JWTClaims represents the structure of the JWT claims.
type Claims struct {
	UserID uint `json:"user_id"`
	Email  string `json:"email"`
	IsGuest bool `json:"is_guest"`
	jwt.RegisteredClaims
}

// GenerateToken - creaet JWT token 7 day expiration
func GenerateToken(userID uint, email string, isGuest bool) (string, error) {
	expirationTime := time.Now().Add(24 * time.Hour * 7) // 7 days

	claims := &Claims{
		UserID:  userID,
		Email:   email,
		IsGuest: isGuest,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecret)
}


// ValidateToken validates a JWT token and returns the claims
func ValidateToken(tokenString string) (*Claims, error) {
	claims := &Claims{}

	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return jwtSecret, nil
	})

	if err != nil {
		return nil, err
	}

	if !token.Valid {
		return nil, errors.New("invalid token")
	}

	return claims, nil
}