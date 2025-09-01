import Link from 'next/link';
export function ZeroFeePolicyContent() {
  return (
    <div className="prose prose-sm max-w-none">
      <p>
        Akashic is a zero-fee crypto donation platform. Unlike most donation
        platforms, Akashic does not charge fees from our users. This means that{' '}
        <strong>
          100% of the amount you donate goes directly to the project!
        </strong>
      </p>
      <p>
        It is free to create a project on Akashic and send or receive donations.
        All donations are truly peer-to-peer, transacted directly from the
        donor’s wallet to the project’s wallet, with no intermediaries involved.
        Akashic is continuously integrating more networks with lower gas fees
        (the amount you pay to the blockchain network when transacting crypto)
        and additional token options for donors to choose from. For some
        networks we work with, these fees are fractions of a penny!
      </p>

      <h2>The Akashic Philosophy</h2>
      <p>
        Rather than building business models, we’re building economic models.
        Our vision is to help nonprofits change the way they’re funded by
        evolving towards their own regenerative microeconomies using the
        innovative tools and funding mechanisms of web3. Instead of relying on
        an outdated model of extracting value from users with fees, we can
        leverage the “money legos” of web3 to reward creation and innovation
        around public goods, build incredible community-driven networks, and
        maximize changemakers’ impact on the ground.
      </p>
      <p>
        Akashic is predominantly funded by donations and grants while we
        continue building towards this vision, leading the way with the launch
        of our own Akashic economy and associated Akashic token in 2019. We are
        developing new revenue streams that support both projects and the
        Akashic DAO through products like AkashicFi, which will generate yields
        on unclaimed crypto donation funds, benefiting both our users and the
        Akashic platform. Ultimately, the launch of Gurves, bonding curves
        collateralized by Akashic, will complete Akashic’s evolution from a
        nonprofit donation platform to a sustainable center for impact
        investing, enabling projects on Akashic to do the same.
      </p>
      <p>
        Read more about what we’re building{' '}
        <Link
          href="https://www.akashic.xyz/blog/what-we-are-building"
          target="_blank"
          rel="noopener noreferrer"
          className="text-pink-500 hover:underline"
        >
          here
        </Link>
        .
      </p>
    </div>
  );
}
