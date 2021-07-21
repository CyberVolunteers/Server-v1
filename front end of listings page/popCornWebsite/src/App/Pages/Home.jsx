import React from 'react'
import Header from '../Components/Header'
import '../../Assets/styles/css/home.css'
import Card from '../Components/Card'
import FeaturedCard from '../Components/FeaturedCard'

function Home() {
    return (
        <div className="Home"> 
            {/* Header */}
            <Header/>


            <div className="featured-card-wrapper w-1000">
                <h1>Featured: Loans with research backed impact</h1>
                <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Nulla ipsa sint numquam adipisci perferendis cupiditate dicta libero rem totam commodi!</p>
                <FeaturedCard img="https://www-kiva-org-0.freetls.fastly.net/img/w480h360/462293fd2c362d08699976464e326bf2.jpg"  title="Kalimurhima Group
" subtitle="Congo (DRC)" desc="A loan of $7,700 helps a member who is going to stock up with bundles of used clothing, which will build up her working capital." meternow="10" totalgo="680"/>
            </div>

            

            <div className="cards-grid w-1000">
         
                <Card  img="https://www-kiva-org-0.freetls.fastly.net/img/w480h360/4cef12842110eabb16e7f2d27acabe5b.jpg"  title="Miguel Antonio" subtitle="Colombia" desc="A loan of $525 helps to improve his tomato greenhouse and acquire an irrigation machine." meternow="20" totalgo="120" />
                <Card  img="https://www-kiva-org-0.freetls.fastly.net/img/w480h360/462293fd2c362d08699976464e326bf2.jpg"  title="Kalimurhima Group
" subtitle="Congo (DRC)" desc="A loan of $7,700 helps a member who is going to stock up with bundles of used clothing, which will build up her working capital." meternow="10" totalgo="680" />
                <Card  img="https://www-kiva-org-0.freetls.fastly.net/img/w480h360/c767c66b71dccf345147220dc67cf491.jpg"  title="Analyn" subtitle="Philippines" desc="A loan of $150 helps to build a sanitary toilet for her family" meternow="25" totalgo="50" />
                
                <Card  img="https://www-kiva-org-0.freetls.fastly.net/img/w480h360/4cef12842110eabb16e7f2d27acabe5b.jpg"  title="Miguel Antonio" subtitle="Colombia" desc="A loan of $525 helps to improve his tomato greenhouse and acquire an irrigation machine." meternow="20" totalgo="120" />
                <Card  img="https://www-kiva-org-0.freetls.fastly.net/img/w480h360/462293fd2c362d08699976464e326bf2.jpg"  title="Kalimurhima Group
" subtitle="Congo (DRC)" desc="A loan of $7,700 helps a member who is going to stock up with bundles of used clothing, which will build up her working capital." meternow="10" totalgo="680" />
                <Card  img="https://www-kiva-org-0.freetls.fastly.net/img/w480h360/c767c66b71dccf345147220dc67cf491.jpg"  title="Analyn" subtitle="Philippines" desc="A loan of $150 helps to build a sanitary toilet for her family" meternow="25" totalgo="50" />
            </div>


        </div>
    )
}

export default Home
 