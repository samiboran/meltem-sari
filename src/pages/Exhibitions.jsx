import { useEffect, useState } from 'react'
import { client, urlFor } from '../lib/sanity'
import './Exhibitions.css'

const Exhibitions = () => {
  const [exhibitions, setExhibitions] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const fetchExhibitions = async () => {
      try {
        const query = `*[_type == "exhibition"] | order(year desc) {
          _id,
          year,
          title,
          type,
          venue,
          location,
          description,
          images
        }`
        
        const data = await client.fetch(query)
        setExhibitions(data)
      } catch (error) {
        console.error('Error fetching exhibitions:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchExhibitions()
  }, [])
  
  if (loading) {
    return (
      <div className="loading">
        <p>Loading...</p>
      </div>
    )
  }
  
  return (
    <div className="exhibitions">
      <div className="exhibitions-list">
        {exhibitions.map((exhibition, index) => (
          <div 
            key={exhibition._id} 
            className="exhibition-item"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="exhibition-year">{exhibition.year}</div>
            <div className="exhibition-details">
              <h3 className="exhibition-title">
                {exhibition.venue}
                {exhibition.location && `, ${exhibition.location}`}
              </h3>
              <p className="exhibition-type">
                {exhibition.type === 'solo' && 'Solo Exhibition'}
                {exhibition.type === 'group' && 'Group Exhibition'}
                {exhibition.type === 'installation' && 'Installation'}
                {exhibition.title && ` / ${exhibition.title}`}
              </p>
              {exhibition.description && (
                <p className="exhibition-description">{exhibition.description}</p>
              )}
              {exhibition.images?.length > 0 && (
                <div className="exhibition-images">
                  {exhibition.images.map((image, i) => (
                    <figure key={image._key || i} className="exhibition-image-wrapper">
                      <img
                        src={urlFor(image).width(1400).quality(90).url()}
                        alt={image.alt || exhibition.title || exhibition.venue || ''}
                        className="exhibition-image"
                        loading="lazy"
                      />
                      {image.caption && (
                        <figcaption className="exhibition-image-caption">{image.caption}</figcaption>
                      )}
                    </figure>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Exhibitions
