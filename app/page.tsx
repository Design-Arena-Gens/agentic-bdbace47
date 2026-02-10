'use client'

import { useState, useEffect } from 'react'

interface Meal {
  id: string
  name: string
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  ingredients: string[]
  day: string
}

interface ShoppingItem {
  id: string
  name: string
  checked: boolean
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default function Home() {
  const [activeTab, setActiveTab] = useState<'planner' | 'shopping'>('planner')
  const [meals, setMeals] = useState<Meal[]>([])
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([])
  const [showModal, setShowModal] = useState(false)
  const [selectedDay, setSelectedDay] = useState('')
  const [newMeal, setNewMeal] = useState({
    name: '',
    type: 'breakfast' as 'breakfast' | 'lunch' | 'dinner' | 'snack',
    ingredients: ['']
  })

  useEffect(() => {
    const savedMeals = localStorage.getItem('meals')
    const savedShoppingList = localStorage.getItem('shoppingList')
    if (savedMeals) setMeals(JSON.parse(savedMeals))
    if (savedShoppingList) setShoppingList(JSON.parse(savedShoppingList))
  }, [])

  useEffect(() => {
    localStorage.setItem('meals', JSON.stringify(meals))
  }, [meals])

  useEffect(() => {
    localStorage.setItem('shoppingList', JSON.stringify(shoppingList))
  }, [shoppingList])

  const openAddMealModal = (day: string) => {
    setSelectedDay(day)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setNewMeal({ name: '', type: 'breakfast', ingredients: [''] })
  }

  const addIngredient = () => {
    setNewMeal({ ...newMeal, ingredients: [...newMeal.ingredients, ''] })
  }

  const removeIngredient = (index: number) => {
    setNewMeal({
      ...newMeal,
      ingredients: newMeal.ingredients.filter((_, i) => i !== index)
    })
  }

  const updateIngredient = (index: number, value: string) => {
    const updated = [...newMeal.ingredients]
    updated[index] = value
    setNewMeal({ ...newMeal, ingredients: updated })
  }

  const saveMeal = () => {
    if (!newMeal.name.trim()) return

    const meal: Meal = {
      id: Date.now().toString(),
      name: newMeal.name,
      type: newMeal.type,
      ingredients: newMeal.ingredients.filter(i => i.trim() !== ''),
      day: selectedDay
    }

    setMeals([...meals, meal])
    closeModal()
  }

  const deleteMeal = (id: string) => {
    setMeals(meals.filter(m => m.id !== id))
  }

  const generateShoppingList = () => {
    const allIngredients = meals.flatMap(meal => meal.ingredients)
    const uniqueIngredients = [...new Set(allIngredients)]

    const newList: ShoppingItem[] = uniqueIngredients.map(ing => ({
      id: Date.now().toString() + Math.random(),
      name: ing,
      checked: false
    }))

    setShoppingList(newList)
    setActiveTab('shopping')
  }

  const toggleShoppingItem = (id: string) => {
    setShoppingList(shoppingList.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    ))
  }

  const clearShoppingList = () => {
    setShoppingList([])
  }

  const getMealsForDay = (day: string) => {
    return meals.filter(m => m.day === day)
  }

  return (
    <div className="container">
      <div className="header">
        <h1>🍽️ Meal Planner</h1>
        <p>Plan your meals & shop smarter</p>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'planner' ? 'active' : ''}`}
          onClick={() => setActiveTab('planner')}
        >
          Weekly Plan
        </button>
        <button
          className={`tab ${activeTab === 'shopping' ? 'active' : ''}`}
          onClick={() => setActiveTab('shopping')}
        >
          Shopping List
        </button>
      </div>

      <div className="content">
        {activeTab === 'planner' && (
          <>
            <div className="section-title">Your Weekly Meal Plan</div>
            {DAYS.map(day => {
              const dayMeals = getMealsForDay(day)
              return (
                <div key={day} className="day-card">
                  <div className="day-header">
                    <div className="day-name">{day}</div>
                    <button
                      className="add-meal-btn"
                      onClick={() => openAddMealModal(day)}
                    >
                      + Add Meal
                    </button>
                  </div>
                  {dayMeals.length === 0 ? (
                    <div style={{ color: '#999', fontSize: '14px', padding: '8px 0' }}>
                      No meals planned
                    </div>
                  ) : (
                    dayMeals.map(meal => (
                      <div key={meal.id} className="meal-item">
                        <div className="meal-info">
                          <div className="meal-name">{meal.name}</div>
                          <div className="meal-type">{meal.type}</div>
                        </div>
                        <button
                          className="delete-btn"
                          onClick={() => deleteMeal(meal.id)}
                        >
                          Delete
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )
            })}
            {meals.length > 0 && (
              <button className="generate-list-btn" onClick={generateShoppingList}>
                Generate Shopping List
              </button>
            )}
          </>
        )}

        {activeTab === 'shopping' && (
          <>
            <div className="section-title">Shopping List</div>
            {shoppingList.length === 0 ? (
              <div className="empty-state">
                <p>No items in your shopping list</p>
                <p style={{ fontSize: '14px', marginTop: '8px' }}>
                  Add meals to your planner and generate a list
                </p>
              </div>
            ) : (
              <>
                <div className="shopping-list">
                  {shoppingList.map(item => (
                    <div key={item.id} className="shopping-item">
                      <input
                        type="checkbox"
                        className="checkbox"
                        checked={item.checked}
                        onChange={() => toggleShoppingItem(item.id)}
                      />
                      <span className={`shopping-item-text ${item.checked ? 'checked' : ''}`}>
                        {item.name}
                      </span>
                    </div>
                  ))}
                </div>
                <button className="clear-list-btn" onClick={clearShoppingList}>
                  Clear Shopping List
                </button>
              </>
            )}
          </>
        )}
      </div>

      {showModal && (
        <div className="modal" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">Add Meal for {selectedDay}</div>

            <div className="form-group">
              <label className="form-label">Meal Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., Spaghetti Bolognese"
                value={newMeal.name}
                onChange={e => setNewMeal({ ...newMeal, name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Meal Type</label>
              <select
                className="form-select"
                value={newMeal.type}
                onChange={e => setNewMeal({ ...newMeal, type: e.target.value as any })}
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Snack</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Ingredients</label>
              {newMeal.ingredients.map((ingredient, index) => (
                <div key={index} className="ingredient-input-group">
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., 500g ground beef"
                    value={ingredient}
                    onChange={e => updateIngredient(index, e.target.value)}
                  />
                  {newMeal.ingredients.length > 1 && (
                    <button
                      className="remove-ingredient-btn"
                      onClick={() => removeIngredient(index)}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button className="add-ingredient-btn" onClick={addIngredient}>
                + Add Ingredient
              </button>
            </div>

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={closeModal}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={saveMeal}>
                Save Meal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
