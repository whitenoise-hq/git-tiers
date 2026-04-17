type TProps = {
  accessToken: string;
  loginId: string;
}
type GithubContributeResponse = {
  data: {
    user: {
      contributionsCollection: {
        contributionCalendar: {
          totalContributions: number;
        };
      };
    };
  };
}

export const getContributeCount = async ({
  accessToken,
  loginId
}: TProps) => {
  if (!accessToken) return "ERROR";
  const graphqlQuery = JSON.stringify({
    query: `
      query($login: String!) {
        user(login: $login) {
          contributionsCollection {
            contributionCalendar {
              totalContributions
            }
          }
        }
      }
    `,
    variables: { login: loginId },
  });

  try {
    const statsResponse = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: graphqlQuery,
    });

    if (!statsResponse.ok) {
      return "ERROR";
    }

    const statsData: GithubContributeResponse = await statsResponse.json();

    return statsData.data.user.contributionsCollection.contributionCalendar.totalContributions;

  } catch {
    return "ERROR";
  }
};