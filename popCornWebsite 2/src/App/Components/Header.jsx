import React from 'react'
import { Link } from 'react-router-dom'
import logo from '../../Assets/img/logo.svg'
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import SearchIcon from '@material-ui/icons/Search';
import MenuIcon from '@material-ui/icons/Menu';
function Header() {
    return (

<>

<aside className="sidebar">
<li>
            <Link>
                Find a cause
            </Link>
            
        </li>
        <li>
            <Link>
                Find a Borrower
            </Link>

        </li>

        <li>
            <Link>
                About Us
            </Link>
            
        </li>
        <li>
            <Link>
                How Works
            </Link>
        </li>
        <li>
            <Link>
                Where Works
            </Link>
        </li>
        <li>
            <Link>
               impact
            </Link>
        </li>
        <li>
            <Link>
                Leadership
            </Link>
        </li>
        <li>
            <Link>
                Financing
            </Link>
        </li>
        <li>
            <Link>
                due diligence
            </Link>
        </li>

</aside>

        {/* // this is header */}
        <header className="Header  ">
          <div className="header-content w-1000 dflex-align-center">
          <img src={logo} alt="" />


<div className="drop-down lend-wrapper">
    <div className="head dflex-align-center">
        <p>Lend</p>
        <ArrowDropDownIcon/>
    </div>
    <ul className="body">
        <li>
            <Link>
                Find a cause
            </Link>
            
        </li>
        <li>
            <Link>
                Find a Borrower
            </Link>

        </li>
    </ul>
</div>

<form action="">
    <div className="input-wrapper dflex-align-center">
        <SearchIcon/>
        <input type="text" placeholder="Search Here..." />
    </div>
</form>

<ul className="dflex-align-center">
    <li>
        <Link>
            Borrow
        </Link>
    </li> 
    <li className="drop-down lend-wrapper about-wrapper">
    <div className="head dflex-align-center">
        <p>About</p>
        <ArrowDropDownIcon/>
    </div>
    <ul className="body">
        <li>
            <Link>
                About Us
            </Link>
            
        </li>
        <li>
            <Link>
                How Works
            </Link>
        </li>
        <li>
            <Link>
                Where Works
            </Link>
        </li>
        <li>
            <Link>
               impact
            </Link>
        </li>
        <li>
            <Link>
                Leadership
            </Link>
        </li>
        <li>
            <Link>
                Financing
            </Link>
        </li>
        <li>
            <Link>
                due diligence
            </Link>
        </li>
    </ul>
</li>

    <li>
        <Link>Sign in</Link>
    </li>
</ul>

<div className="burger-icon" onClick={e=>{
    document.querySelector(".sidebar").classList.toggle("active")
}}>
<MenuIcon/>
</div>
          </div>
        </header>
        </>
    )
    
}

export default Header
