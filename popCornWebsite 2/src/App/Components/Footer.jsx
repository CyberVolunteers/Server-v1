import React from 'react'
import { Link } from 'react-router-dom'

function Footer() {
    return (
        <div className="Footer w-1000">
            <div className="top-area">
                <ul>
                    <li className="heading">
                    Borrow
                    </li>
                    <li>
                    Loans for entrepreneurs doing amazing things.
                    </li>
                    <li>
                        <Link>
                            Apply now
                        </Link>
                    </li>
                </ul>

                <ul>
                    <li className="heading">
                    Get to know us
                    </li>
                    <li>
                        <Link>
                        
                        About us

                        </Link>
                    </li>
                    <li>
                        <Link>
                        
                        How Kiva works
           </Link>
                    </li>
                    <li>
                        <Link>
                        
                        FAQs
  

                        </Link>
                    </li>
                    <li>
                        <Link>
                        
                        Where Kiva works

           

                        </Link>
                    </li>
                    <li>
                        <Link>
                        
                        Blog

                        </Link>
                    </li>
                    <li>
                        <Link>
                        
                        Partner with us



                        </Link>
                    </li>
                    <li>
                        <Link>
                        
                        Contact us


                        </Link>
                    </li>
                    <li>
                        <Link>
                        
                        Help


                        </Link>
                    </li>
                </ul>

                <ul>
                    <li className="heading">
                    Lend

                    </li>
                    <li>
                    Make a loan, change a life.
                    </li>

                    <li>
                        <Link>
                        Lend now

                        
                        </Link>

                    </li>
                    <li>
                        <Link>
                        Monthly Good

                        
                        </Link>

                    </li>
                </ul>

                <ul>
                    <li className="heading">
                    Explore

                    </li>
            
                    <li>
                        <Link>
                        Protocol

                        
                        </Link>

                    </li>
                    <li>
                        <Link>
                        Gifts



                        
                        </Link>

                    </li>
                    <li>
                        <Link>
                        Happening now



                        
                        </Link>

                    </li>
                    <li>
                        <Link>
                        Developer API




                        
                        </Link>

                    </li>
                </ul>


                <ul>
                    <li className="heading">
                    Community
                    </li>
                    <li>
                        <Link>
                        Teams

                        </Link>
                    </li>
                    <li>
                        <Link>
                        Students and educators

                        </Link>
                    </li>
                </ul>   

                <ul>
                    <li className="heading">
                  Company
                    </li>

                    <li>
                        <Link>
                        Privacy policy
                        </Link>
                    </li>
                    <li>
                        <Link>
                        Cookie and Data Settings

                        </Link>
                    </li>
                    <li>
                        <Link>
                        Terms of use

                        </Link>
                    </li>
                    <li>
                        <Link>
                        Site map

                        </Link>
                    </li>
                </ul>

            </div>


            <p>
            Lending through Kiva involves risk of principal loss. Kiva does not guarantee repayment or offer a financial return on your loan.
            </p>

            <p className="copy-right">
            © 2021 Kiva. All rights reserved.
            </p>
        </div>
    )
}

export default Footer
