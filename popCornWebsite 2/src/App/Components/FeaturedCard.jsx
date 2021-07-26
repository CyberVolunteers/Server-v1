import React from 'react'

function FeaturedCard({img,title,subtitle,desc,meternow,totalgo}) {
    return (
        <div className="FeaturedCard w-1000">
            {/* <img src="https://www-kiva-org-0.freetls.fastly.net/img/w480h360/462293fd2c362d08699976464e326bf2.jpg" alt="" /> */}
            <img src={img} alt="" />

            <div className="presentation">
                <h3>{title}</h3>
        <h4>{subtitle}</h4>

        <p className="description">
           {desc}

            <a href="#" >Read more</a>
            </p>

            <div className="meter-total">
                <div className="meter"></div>
            </div>

            <span className="total-go">
               {totalgo}$ to go
            </span>

            <button className="voulunteer-now">
            Volunteer Now
                </button>

            </div>
        </div>
    )
}

export default FeaturedCard
