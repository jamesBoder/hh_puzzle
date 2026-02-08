// backend/cmd/test_crossword/main.go
package main

import (
    "fmt"
    "github.com/warmans/go-crossword"
)

func main() {
    words := []crossword.Word{
        {Word: "TUPAC", Clue: "Legendary West Coast rapper (5)"},
        {Word: "BIGGIE", Clue: "The Notorious B.I.G. (6)"},
        {Word: "NAS", Clue: "Illmatic rapper (3)"},
        {Word: "JAYZ", Clue: "Brooklyn's finest (4)"},
        {Word: "EMINEM", Clue: "Slim Shady (6)"},
    }
    
    cw := crossword.Generate(15, words, 10, 
        crossword.WithAllAttempts(true),
        crossword.WithRevealFirstLetterOfEachWord(true))
    
    fmt.Printf("Generated puzzle with %d words\n", len(cw.Words))
    fmt.Print(crossword.RenderText(cw, crossword.WithAllSolved(true)))
}
