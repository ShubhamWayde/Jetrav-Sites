import Hero from '../../components/sections/hero/hero';
import Token from '../../components/sections/token/token';
import Peace from '../../components/sections/peace/peace';
import Solutions from '../../components/sections/solutions/solutions';
import ChangePlans from '../../components/sections/change-plans/change-plans';
import Cta from '../../components/sections/cta/cta';
import AboutJetrav from '../../components/sections/about-jetrav/about-jetrav';
import Packages from '../../components/sections/packages/packages';

export default function Home() {
  return (
    <>
      <Hero />
      <Packages />
      <Token />
      <Peace />
      <AboutJetrav />
      <Solutions />
      <ChangePlans />
      <Cta />
    </>
  );
}
