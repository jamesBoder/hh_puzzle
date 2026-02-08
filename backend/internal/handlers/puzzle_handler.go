package handlers

import (
	"strconv"

	"github.com/gin-gonic/gin"
	"hh_puzzle/internal/services"
)

// PuzzleHandler handles puzzle-related HTTP requests
type PuzzleHandler struct {
	puzzleService services.PuzzleService
}

// NewPuzzleHandler creates a new puzzle handler
func NewPuzzleHandler(puzzleService services.PuzzleService) *PuzzleHandler {
	return &PuzzleHandler{
		puzzleService: puzzleService,
	}
}

// GetPuzzles returns a list of puzzles with filters
func (h *PuzzleHandler) GetPuzzles(c *gin.Context) {
	// Parse query parameters
	difficulty := c.Query("difficulty")
	decade := c.Query("decade")
	region := c.Query("region")
	
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	perPage, _ := strconv.Atoi(c.DefaultQuery("per_page", "20"))

	filters := services.PuzzleFilters{
		Difficulty: difficulty,
		Decade:     decade,
		Region:     region,
		Page:       page,
		PerPage:    perPage,
	}

	puzzles, servicePagination, err := h.puzzleService.GetPuzzlesByFilters(filters)
	if err != nil {
		RespondInternalError(c, err.Error())
		return
	}

	// Convert service pagination to handler pagination
	pagination := Pagination{
		Page:       servicePagination.Page,
		PerPage:    servicePagination.PerPage,
		Total:      servicePagination.Total,
		TotalPages: servicePagination.TotalPages,
	}

	RespondPaginated(c, puzzles, pagination)
}

// GetPuzzleByID returns a single puzzle by ID
func (h *PuzzleHandler) GetPuzzleByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		RespondBadRequest(c, "Invalid puzzle ID")
		return
	}

	puzzle, err := h.puzzleService.GetPuzzleByID(uint(id))
	if err != nil {
		RespondNotFound(c, "Puzzle not found")
		return
	}

	RespondSuccess(c, puzzle, "")
}

// GetDailyChallenge returns today's daily challenge
func (h *PuzzleHandler) GetDailyChallenge(c *gin.Context) {
	puzzle, err := h.puzzleService.GetDailyChallenge()
	if err != nil {
		RespondNotFound(c, "No daily challenge available")
		return
	}

	RespondSuccess(c, puzzle, "")
}

// GetPuzzlePacks returns all available puzzle packs
func (h *PuzzleHandler) GetPuzzlePacks(c *gin.Context) {
	packs, err := h.puzzleService.GetAvailablePacks()
	if err != nil {
		RespondInternalError(c, err.Error())
		return
	}

	RespondSuccess(c, packs, "")
}

// GetPuzzlePackByID returns a single puzzle pack by ID
func (h *PuzzleHandler) GetPuzzlePackByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		RespondBadRequest(c, "Invalid pack ID")
		return
	}

	pack, err := h.puzzleService.GetPuzzlePack(uint(id))
	if err != nil {
		RespondNotFound(c, "Puzzle pack not found")
		return
	}

	RespondSuccess(c, pack, "")
}
