import BestSeller from "../components/BestSeller"
import Hero from "../components/Hero"
import LatestCollection from "../components/LatestCollection"
import NewletterBox from "../components/NewletterBox"
import OurPolicy from "../components/OurPolicy"

const Home = () => {
  return (
    <div>
      {/* Hero full width - break out of container */}
      <div className="-mx-4 sm:-mx-[5vw] md:-mx-[7vw] lg:-mx-[9vw]">
        <Hero/>
      </div>
      <LatestCollection/>
      <BestSeller/>
      <OurPolicy/>
      <NewletterBox/>
    </div>
  )
}

export default Home
