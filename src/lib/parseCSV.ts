export interface Movie {
  id: number
  title: string
  original_title: string
  overview: string
  release_date: string
  vote_average: number
  vote_count: number
  popularity: number
  runtime: number
  genres: { id: number; name: string }[]
  tagline: string
}

export function parseCSV(csvText: string): Movie[] {
  const lines = csvText.split('\n')
  const headers = parseCSVLine(lines[0])
  
  const movies: Movie[] = []
  
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue
    
    const values = parseCSVLine(lines[i])
    const row: Record<string, string> = {}
    
    headers.forEach((header, index) => {
      row[header] = values[index] || ''
    })
    
    try {
      const movie: Movie = {
        id: parseInt(row.id) || 0,
        title: row.title || '',
        original_title: row.original_title || '',
        overview: row.overview || '',
        release_date: row.release_date || '',
        vote_average: parseFloat(row.vote_average) || 0,
        vote_count: parseInt(row.vote_count) || 0,
        popularity: parseFloat(row.popularity) || 0,
        runtime: parseInt(row.runtime) || 0,
        genres: parseJSONField(row.genres),
        tagline: row.tagline || '',
      }
      
      if (movie.id && movie.title) {
        movies.push(movie)
      }
    } catch (e) {
      // Skip malformed rows
    }
  }
  
  return movies
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }
  
  result.push(current)
  return result
}

function parseJSONField(value: string): { id: number; name: string }[] {
  if (!value) return []
  try {
    return JSON.parse(value.replace(/""/g, '"'))
  } catch {
    return []
  }
}
