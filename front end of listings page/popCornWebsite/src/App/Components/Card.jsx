import React from 'react'

function Card({img,title,subtitle,desc,meternow,totalgo}) {
    return (
        <div className="Card">
            <img src={img}/>
          <div className="bottom">
          <h3 className="title">{title}</h3>
            <h4 className="subtitle">{subtitle}</h4>
            <p className="description">
            {desc}

            <a href="#" >Read more</a>
            </p>

            <div className="meter-total">
                <div className="meter" style={{width:`${meternow}%`}}></div>
            </div>

            <span className="total-go">
                {totalgo}$ to go
            </span>

            <div className="submittion-area dflex-align-center">
                <select name="" id="">
                    <option value="25">$25</option>
                    <option value="50">$50</option>
                    <option value="75">$75</option>
                    <option value="100">$100</option>
                    <option value="125">$125</option>
                    <option value="150">$150</option>
                    <option value="175">$175</option>
                    <option value="200">$200</option>
                    <option value="225">$225</option>
                    <option value="250">$250</option>
                    <option value="275">$275</option>
                    <option value="300">$300</option>
                    <option value="325">$325</option>
                    <option value="350">$350</option>
                    <option value="375">$375</option>
                    <option value="400">$400</option>
                    <option value="425">$425</option>
                    <option value="450">$450</option>
                    <option value="475">$475</option>
                    <option value="500">$500</option>
                    
                </select>


                <button className="lend-now">
                    Lend now
                </button>
            </div>
          </div>
        </div>
    )
}

export default Card
