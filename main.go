package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"os"
	"strings"

	"golang.org/x/oauth2/clientcredentials"
)

func main() {
	clientID := os.Getenv("CLIENT_ID")
	clientSecret := os.Getenv("CLIENT_SECRET")
	tokenURL := os.Getenv("TOKEN_URL")
	baseURL := os.Getenv("BASE_URL")

	cc := clientcredentials.Config{
		ClientID:     clientID,
		ClientSecret: clientSecret,
		TokenURL:     tokenURL,
	}

	client := cc.Client(context.Background())

	data := strings.NewReader(`{
    "phone": "+8562099482222",
    "first_name": "jonh",
    "last_name": "max",
    "gender": "m"
}`)

	res, err := client.Post(baseURL+"/api/v1/auth/sso/login", "application/json", data)
	if err != nil {
		slog.Error("Failed to make request", "error", err)
	}

	bodyBytes, err := io.ReadAll(res.Body)
	if err != nil {
		slog.Error("Failed to read response body", "error", err)
		return
	}

	re := struct {
		LoginUrl string `json:"login_url"`
	}{}

	if err := json.Unmarshal(bodyBytes, &re); err != nil {
		slog.Error("failed to unmarshal")
	}

	fmt.Printf("%v", re.LoginUrl)
}
