"use strict";

const e = React.createElement;

const swipeThreshold = 10;
const swipeCooldown = 250;

// TODO: add a Jumbotron
const {
  Alert,
  Image,
  Modal,
  Button,
  Carousel,
  Card,
  Navbar,
  Nav,
  NavDropdown,
} = ReactBootstrap;

class SeeMoreFiller {}

class CustomNavbar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      leftLinks: [
        { text: "Contact", href: "/contactUsLinks" },
        { text: "About", href: "/aboutUs" },
        { text: "Search listings", href: "/listingsPage" },
      ],
    };
    this.state.rightLinks = window.isLoggedIn
      ? [{ text: "My Account", href: "/myAccount" }]
      : [
          { text: "Join", href: "/joinUs" },
          { text: "Log in", href: "/login" },
        ];
  }

  render() {
    return (
      <div className="bg-light" style={{ width: "100%" }}>
        <Navbar expand="lg mx-auto" style={{ maxWidth: "1000px" }}>
          <Navbar.Brand className="ps-2 ps-lg-0" href="/">
            <img
              src="/IMG/Logo main 3.svg"
              height={screen.width > 400 ? "50" : "40"}
              className="d-inline-block align-top"
              alt="Home"
            />
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              {this.state.leftLinks.map((props, index) => (
                <Nav.Link href={props.href} key={index}>
                  <div className="ps-2 ps-lg-0">{props.text}</div>
                </Nav.Link>
              ))}
            </Nav>
            <Nav>
              {this.state.rightLinks.map((props, index) => (
                <Nav.Link href={props.href} key={index}>
                  <div className="ps-2 ps-lg-0">{props.text}</div>
                </Nav.Link>
              ))}
            </Nav>
          </Navbar.Collapse>
        </Navbar>
      </div>
    );
  }
}

class MultipleItemCarousel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeIndex: 0,
      isRightButtonActive: this.props.items.length > this.props.itemsPerSlide, // if more than one slide
      isLeftButtonActive: false,
      touchX: null,
      touchEnabled: true,
    };
  }

  componentWillReceiveProps(props) {
    if (!this.props.resetSlide) return;
    this.setState({ slide: false }); // disable the animation
    this.moveToBeginning(props);
    setTimeout(() => this.setState({ slide: true }), 0); // re-enable the animation as soon as possible once everything else finishes
  }

  updateButtons() {
    if (!this.carouselRef) return;
    for (let element of this.carouselRef.element.children) {
      const className = element.className;
      if (className.includes("prev") || className.includes("next"))
        element.classList.remove("disabled-button");
      if (className.includes("prev") && !this.state.isLeftButtonActive)
        element.classList.add("disabled-button");
      if (className.includes("next") && !this.state.isRightButtonActive)
        element.classList.add("disabled-button");
    }
  }

  updateTouch(evt, isInitial) {
    let newTouchX;
    if (evt.targetTouches !== undefined)
      newTouchX = evt.targetTouches[0].clientX;
    else newTouchX = evt.clientX;

    if (this.state.touchX === null)
      return isInitial ? this.setState({ touchX: newTouchX }) : null;

    if (!this.state.touchEnabled) return;

    const displacement = newTouchX - this.state.touchX;

    if (Math.abs(displacement) > swipeThreshold) {
      this.setState({ touchEnabled: false });
      setTimeout(() => this.setState({ touchEnabled: true }), swipeCooldown);
      this.move(displacement > 0);
    }

    this.setState({ touchX: newTouchX });
  }

  endTouch() {
    this.setState({ touchX: null });
  }

  moveToBeginning(props) {
    this.setState({
      activeIndex: 0,
      isLeftButtonActive: false,
      isRightButtonActive: props.items.length > props.itemsPerSlide, // if more than one slide
    });

    this.updateButtons();
  }

  move(isLeft) {
    let activeIndex = this.state.activeIndex;
    let index;
    const numberOfPagesNeededToShowItems = Math.ceil(
      this.props.items.length / this.props.itemsPerSlide
    );
    const maxPageIndex =
      Math.min(numberOfPagesNeededToShowItems, this.props.maxItemsPages) - 1; // number of pages - 1 = index
    console.log(maxPageIndex);
    if (isLeft) index = Math.max(0, activeIndex - 1);
    if (!isLeft) index = Math.min(maxPageIndex, activeIndex + 1); // only scroll if it is not on a boundary

    let isRightButtonActive = true;
    let isLeftButtonActive = true;
    if (index == 0) isLeftButtonActive = false;
    if (index == maxPageIndex) isRightButtonActive = false;

    this.setState({
      activeIndex: index,
      isLeftButtonActive,
      isRightButtonActive,
    });

    this.updateButtons();
  }

  render() {
    return (
      <Carousel
        style={this.props.style}
        onTouchStart={(evt) => this.updateTouch(evt, true)}
        onTouchMove={(evt) => this.updateTouch(evt)}
        onTouchEnd={() => this.endTouch()}
        onMouseDown={(evt) => this.updateTouch(evt, true)}
        onMouseMove={(evt) => this.updateTouch(evt)}
        onMouseUp={() => this.endTouch()}
        onMouseLeave={() => this.endTouch()}
        slide={this.state.slide}
        wrap={true} // to enable the buttons
        touch={false}
        ref={(ref) => {
          this.carouselRef = ref;
          this.updateButtons();
        }}
        activeIndex={this.state.activeIndex}
        onSelect={(index, evt) => {
          // limit index
          const isLeft = evt.target.attributes.class.nodeValue.includes("prev");
          this.move(isLeft);
        }}
        nextLabel={null}
        prevLabel={null}
        indicators={false}
        interval={null}
        className={`multiple-item-carousel unselectable ${this.props.className}`}
      >
        {splitIntoGroups(
          this.props.items,
          this.props.itemsPerSlide,
          this.props.maxItemsPages
        ).map((slideItems, slideIdex) => (
          <Carousel.Item key={slideIdex} className="container">
            <div className="row g-4 justify-content-around">
              {slideItems.map((item) => {
                const index = this.props.items.findIndex((el) => el == item);
                const InnerComponent =
                  item instanceof SeeMoreFiller ||
                  item.listing instanceof SeeMoreFiller
                    ? this.props.seeMoreComponent
                    : this.props.normalItemComponent;
                return (
                  <InnerComponent
                    key={index}
                    item={item}
                    index={index}
                    carousel={this}
                  ></InnerComponent>
                );
              })}
            </div>
          </Carousel.Item>
        ))}
      </Carousel>
    );
  }
}

class Homepage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      categories: [
        "Community", // 0
        "Computers & Technology", // 1
        "Education", // 2
        "Healthcare & Medicine", // 3
        "Elderly", // 4
        "Arts & Culture", // 5
        "Advocacy & Human Rights", // 6
      ],
      listings: [
        {
          uuid: "7af5a892-8bfc-11eb-afb8-dadd5bd8c1d2",
          categoryIndex: 0,
          opportunityTitle: "BMEYPP Champions",
          charityName: "Black and Minority Ethnic Young People's Project",
          imgName: "BMEYPP_youth_champs.jpeg",
        },
        {
          uuid: "25d459b7-8c18-11eb-afb8-dadd5bd8c1d2",
          categoryIndex: 0,
          opportunityTitle: "Gardening volunteer",
          charityName: "Guild Care",
          imgName: "guildCare1.jpg",
        },
        {
          uuid: "710627d9-9586-11eb-afb8-dadd5bd8c1d2",
          categoryIndex: 0,
          opportunityTitle: "Workshop Manager",
          charityName: "Freedom Power Chairs",
          imgName: "FPC2.jpg",
        },
        {
          uuid: "b5a544db-8bff-11eb-afb8-dadd5bd8c1d2",
          categoryIndex: 0,
          opportunityTitle: "Retail Charity Shop Assistant",
          charityName: "Guild Care",
          imgName: "guildCare2.jpg",
        },
        {
          uuid: "ed6ea111-8c20-11eb-afb8-dadd5bd8c1d2",
          categoryIndex: 0,
          opportunityTitle: "Youth Club volunteers",
          charityName: "Hangleton and Knoll Project",
          imgName: "hkProject1.jpg",
        },
        {
          categoryIndex: 0,
          listing: new SeeMoreFiller(),
        },
        {
          uuid: "21b505cb-9553-11eb-afb8-dadd5bd8c1d2",
          categoryIndex: 1,
          opportunityTitle: "Social Media Manager",
          charityName: "OSCAR Foundation",
          imgName: "oscar_social_media_manger.jpeg",
        },
        {
          uuid: "85730846-8ca5-11eb-afb8-dadd5bd8c1d2",
          categoryIndex: 1,
          opportunityTitle: "Network Manager",
          charityName: "Freedom Power Chairs",
          imgName: "FPC3.jpg",
        },
        {
          uuid: "1602cd06-9195-11eb-afb8-dadd5bd8c1d2",
          categoryIndex: 1,
          opportunityTitle: "Youth Club Social Media Volunteer",
          charityName: "Hangleton and Knoll Project",
          imgName: "hkProject1.jpg",
        },
        {
          uuid: "c37df565-9583-11eb-afb8-dadd5bd8c1d2",
          categoryIndex: 1,
          opportunityTitle: "CAD Designer",
          charityName: "Freedom Power Chairs",
          imgName: "FPC4.jpg",
        },
        {
          uuid: "b5a544db-8bff-11eb-afb8-dadd5bd8c1d2",
          categoryIndex: 1,
          opportunityTitle: "Retail Charity Shop Assistant",
          charityName: "Guild Care",
          imgName: "guildCareShop.jpg",
        },
        {
          categoryIndex: 1,
          listing: new SeeMoreFiller(),
        },
        {
          uuid: "470037bb-9553-11eb-afb8-dadd5bd8c1d2",
          categoryIndex: 2,
          opportunityTitle: "Mentoring Young People",
          charityName: "OSCAR Foundation",
          imgName: "oscar_mentioring_young_people.jpeg",
        },
        {
          uuid: "7af5a892-8bfc-11eb-afb8-dadd5bd8c1d2",
          categoryIndex: 2,
          opportunityTitle: "BMEYPP Champions",
          charityName: "Black and Minority Ethnic Young People's Project",
          imgName: "BMEYPP_youth_champs.jpeg",
        },
        {
          uuid: "f7b249b7-9552-11eb-afb8-dadd5bd8c1d2",
          categoryIndex: 2,
          opportunityTitle: "Report Writing",
          charityName: "OSCAR Foundation",
          imgName: "oscar_report_writing.jpeg",
        },
        {
          uuid: "7d9da10d-92e8-11eb-afb8-dadd5bd8c1d2",
          categoryIndex: 2,
          opportunityTitle: "Records & Statistics",
          charityName: "Freedom Power Chairs",
          imgName: "FPC5.jpg",
        },
        {
          uuid: "d2b5ac05-9552-11eb-afb8-dadd5bd8c1d2",
          categoryIndex: 2,
          opportunityTitle: "Part Time Helper",
          charityName: "OSCAR Foundation",
          imgName: "oscar1.jpg",
        },
        {
          categoryIndex: 2,
          listing: new SeeMoreFiller(),
        },
        {
          uuid: "5ad1b3b8-8ca4-11eb-afb8-dadd5bd8c1d2",
          categoryIndex: 3,
          opportunityTitle: "Admin – Assistant to the Trustees",
          charityName: "Freedom Power Chairs",
          imgName: "FPC2.jpg",
        },
        {
          uuid: "9bd6f5d6-8c17-11eb-afb8-dadd5bd8c1d2",
          categoryIndex: 3,
          opportunityTitle: "Home from Hospital Volunteers",
          charityName: "Guild Care",
          imgName: "Guild_care_home_and_hosptial_volunteers.jpeg",
        },
        {
          uuid: "845386ff-9581-11eb-afb8-dadd5bd8c1d2",
          categoryIndex: 3,
          opportunityTitle: "Assessor - Clients",
          charityName: "Freedom Power Chairs",
          imgName: "FPC3.jpg",
        },
        {
          uuid: "0c8c3b1c-8c20-11eb-afb8-dadd5bd8c1d2",
          categoryIndex: 3,
          opportunityTitle: "Befriending an older person in the community.",
          charityName: "Time to Talk Befriending",
          imgName: "ttb_befriending_older_people.jpeg",
        },
        {
          uuid: "710627d9-9586-11eb-afb8-dadd5bd8c1d2",
          categoryIndex: 3,
          opportunityTitle: "Workshop Manager",
          charityName: "Freedom Power Chairs",
          imgName: "FPC4.jpg",
        },
        {
          categoryIndex: 3,
          listing: new SeeMoreFiller(),
        },
        {
          uuid: "0c8c3b1c-8c20-11eb-afb8-dadd5bd8c1d2",
          categoryIndex: 4,
          opportunityTitle: "Befriending an older person in the community.",
          charityName: "Time to Talk Befriending",
          imgName: "ttb_befriending_older_people.jpeg",
        },
        {
          uuid: "25d459b7-8c18-11eb-afb8-dadd5bd8c1d2",
          categoryIndex: 4,
          opportunityTitle: "Gardening volunteer",
          charityName: "Guild Care",
          imgName: "guildCare2.jpg",
        },
        {
          uuid: "845386ff-9581-11eb-afb8-dadd5bd8c1d2",
          categoryIndex: 4,
          opportunityTitle: "Assessor - Clients",
          charityName: "Freedom Power Chairs",
          imgName: "FPC5.jpg",
        },
        {
          uuid: "9bd6f5d6-8c17-11eb-afb8-dadd5bd8c1d2",
          categoryIndex: 4,
          opportunityTitle: "Home from Hospital Volunteers",
          charityName: "Guild Care",
          imgName: "Guild_care_home_and_hosptial_volunteers.jpeg",
        },
        {
          uuid: "5ad1b3b8-8ca4-11eb-afb8-dadd5bd8c1d2",
          categoryIndex: 4,
          opportunityTitle: "Admin – Assistant to the Trustees",
          charityName: "Freedom Power Chairs",
          imgName: "FPC2.jpg",
        },
        {
          categoryIndex: 4,
          listing: new SeeMoreFiller(),
        },
      ],

      currentCategoryIndex: 0,
    };

    function getNewSettings() {
      const out = {
        categoriesPerSlide: screen.width > 992 ? 3 : 1, // bootstrap breakpoint
        maxCategoriesPages: screen.width > 992 ? 2 : 6,
        maxCharactersListingCharityName: screen.width > 485 ? 35 : 20,
        maxCharactersListingTitle: screen.width > 485 ? 35 : 20,
      };

      if (screen.width >= 1400) {
        out.listingsPerSlide = 3;
        out.maxListingPages = 2;
      } else if (screen.width >= 992) {
        out.listingsPerSlide = 2;
        out.maxListingPages = 3;
      } else {
        out.listingsPerSlide = 1;
        out.maxListingPages = 6;
      }

      return out;
    }

    window.addEventListener(
      "resize",
      function () {
        this.setState(getNewSettings());
      }.bind(this)
    );

    this.state = Object.assign(this.state, getNewSettings());
  }

  render() {
    return (
      <div className="react-page-container container-fluid">
        <CustomNavbar />
        <div className="container large-mt welcome-part-container">
          <div className="container mx-auto">
            <div className="row mt-lg g-3">
              <div className="col-lg-7 mx-auto align-self-center">
                <div className="large-margin">
                  <p className="ratio ratio-16x9">
                    <video controls poster="/IMG/cybervolunteers_thumbnail.png">
                      <source
                        src="/IMG/introduction_video.mp4"
                        preload="none"
                        type="video/mp4"
                      />
                    </video>
                  </p>
                </div>
              </div>
              <div className="col-lg-5 container first-lines-container mt-3">
                <div className="mx-auto">
                  <div className="ms-lg-auto mx-auto width-min-lg-max">
                    <div className="text-center width-min-lg-max text-container">
                      <div className="width-min-lg-max">
                        <span className="col-lg main-header-text">
                          <span className="grey-text thin-text">
                            Connecting
                          </span>
                          <span className="blue-text thick-text ps-3 pt-3">
                            People
                          </span>
                        </span>
                      </div>
                      <div className="width-min-lg-max text-right">
                        <span className="col-lg main-header-text">
                          <span className="grey-text thin-text">with</span>
                          <span className="blue-text thick-text ps-3 pt-3">
                            Purpose
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* <span className="row text-right">
                    <span className="col-lg-12 dark-grey-text main-subheading-text text-left mt-4">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit,
                      sed do eiusmod tempor incididunt ut labore
                    </span>
                  </span> */}
                    <span className="row">
                      <span className="col-lg-12 find-opportunity-button-container">
                        <Button
                          variant="primary d-block mr-auto p-2 find-opportunity-button text-center"
                          href={`./listingsPage`}
                        >
                          Find an opportunity
                        </Button>
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* <Alert variant={"warning"} className="mt-3">
          <Alert.Heading> Attention, charities:</Alert.Heading>
          <p>
            Pupils from Brighton College are volunteering between 9th and 25th
            June. Groups of 6-10 students in year 11 or 13 are available to help
            under teacher supervision, with transport being arranged by the
            school.
          </p>
          <p>
            If you are a charity that could use the help please email
            hello@cybervolunteers.org.uk.
          </p>
        </Alert> */}
        {/* Examples of listings */}
        <div className="container listings-examples large-mt-lg">
          <h2 className="mx-auto text-center header mb-3">
            Support causes you care about.
          </h2>

          <MultipleItemCarousel
            className="category-carousel mx-auto"
            itemsPerSlide={this.state.categoriesPerSlide}
            maxItemsPages={this.state.maxCategoriesPages}
            items={this.state.categories}
            seeMoreComponent={() => (
              <div className="col-lg-3 category-container">
                <table style={{ height: "100%", width: "100%" }}>
                  <tbody>
                    <tr>
                      <td className="align-middle">
                        <Button
                          href={`./listingsPage`}
                          variant="outline-primary"
                          className="category-box see-more-category-box mx-auto d-block"
                        >
                          See More!
                        </Button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
            normalItemComponent={(props) => {
              return (
                <div className="col-lg-3 category-container">
                  <Button
                    style={{ height: "100%", width: "100%" }}
                    variant="link"
                    className="category-box existing-category mx-auto d-block"
                    onClick={() =>
                      this.setState({ currentCategoryIndex: props.index })
                    }
                  >
                    <table style={{ height: "100%", width: "100%" }}>
                      <tbody>
                        <tr>
                          <td className="align-middle">{props.item}</td>
                        </tr>
                      </tbody>
                    </table>
                  </Button>
                </div>
              );
            }}
          ></MultipleItemCarousel>

          <MultipleItemCarousel
            resetSlide={true}
            ref={(el) => (this.listingCarousel = el)}
            itemsPerSlide={this.state.listingsPerSlide}
            maxItemsPages={this.state.maxListingPages}
            items={this.state.listings.filter((el) => {
              return el.categoryIndex === this.state.currentCategoryIndex;
            })}
            className="listings-carousel"
            seeMoreComponent={() => {
              return (
                <div
                  className={`${
                    this.state.listingsPerSlide == 3 ? "col-lg-4" : "col-lg-6"
                  } listing-container`}
                >
                  <Card className="mx-auto listing-box">
                    <Card.Body>
                      <Button
                        href={`./listingsPage`}
                        variant="link"
                        style={{ height: "100%", width: "100%" }}
                      >
                        <table style={{ height: "100%", width: "100%" }}>
                          <tbody>
                            <tr>
                              <td className="align-middle">
                                View all listings
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </Button>
                    </Card.Body>
                  </Card>
                </div>
              );
            }}
            normalItemComponent={(props) => {
              const { item } = props;
              return (
                <div
                  className={`${
                    this.state.listingsPerSlide == 3 ? "col-lg-4" : "col-lg-6"
                  } listing-container`}
                >
                  <Card className="mx-auto listing-box">
                    <Card.Img
                      variant="top"
                      src={"../IMG/" + item.imgName}
                      className="mx-auto d-block listing-img img-fluid"
                      onDragStart={(evt) => evt.preventDefault()}
                    />
                    <Card.Body className="listing-card-body d-flex align-items-center flex-column">
                      <Card.Title className="pt-1 listing-title">
                        <span className="w-100">
                          <Button
                            variant="link"
                            href={`./listing?uuid=${item.uuid}`}
                            className="mx-auto d-block listing-title w-100 h-100"
                          >
                            {truncate(
                              item.opportunityTitle,
                              this.state.maxCharactersListingTitle
                            )}
                          </Button>
                        </span>
                      </Card.Title>
                      <Card.Text className="pt-1 listing-charity-name">
                        {truncate(
                          item.charityName,
                          this.state.maxCharactersListingCharityName
                        )}
                      </Card.Text>
                      <Button
                        href={`./listing?uuid=${item.uuid}`}
                        className="mt-auto listing-button d-block"
                        variant="primary"
                      >
                        I want to help
                      </Button>
                    </Card.Body>
                  </Card>
                </div>
              );
            }}
          ></MultipleItemCarousel>
        </div>
      </div>
    );
  }
}

function truncate(input, maxLength) {
  return input.length > maxLength
    ? `${input.substring(0, maxLength)}...`
    : input;
}

function splitIntoGroups(array, numberPerPage, maxPages) {
  let groups = [[]];
  let currentIndex = 0;
  let lastItemIndex = 0;
  for (let itemIndex in array) {
    let item = array[itemIndex];
    // if the group is full already
    if (groups[currentIndex].length === numberPerPage) {
      currentIndex++;
      if (currentIndex > maxPages - 1) break; // if would go over the page number, abort
      groups.push([]);
    }
    groups[currentIndex].push(item);
    lastItemIndex = itemIndex;
  }

  // replace the last object with a filler, but only if there is more to see
  if (lastItemIndex == array.length - 1) return groups;

  let lastSlide = groups[groups.length - 1];
  lastSlide[lastSlide.length - 1] = new SeeMoreFiller();
  return groups;
}

const domContainer = document.querySelector("#pageContainer");
ReactDOM.render(e(Homepage), domContainer);
