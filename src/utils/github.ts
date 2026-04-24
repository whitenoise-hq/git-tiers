interface ContributeCountParams {
  accessToken: string;
  loginId: string;
}

interface GithubContributeResponse {
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

const GITHUB_GRAPHQL_URL = 'https://api.github.com/graphql';

const CONTRIBUTIONS_QUERY = `
  query($login: String!) {
    user(login: $login) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
        }
      }
    }
  }
`;

export const getContributeCount = async ({
  accessToken,
  loginId,
}: ContributeCountParams): Promise<number | 'ERROR'> => {
  if (!accessToken) return 'ERROR';

  try {
    const response = await fetch(GITHUB_GRAPHQL_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: CONTRIBUTIONS_QUERY,
        variables: { login: loginId },
      }),
    });

    if (!response.ok) return 'ERROR';

    const data: GithubContributeResponse = await response.json();
    return data.data.user.contributionsCollection.contributionCalendar.totalContributions;
  } catch {
    return 'ERROR';
  }
};