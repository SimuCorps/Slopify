import requests
import json


BASE_API_URL = 'https://api.github.com/repos/DishpitDev/Slopify'


def fetch_contributors():
    page = 1
    fetched_contributors = []
    all_contributors = []

    while page == 1 or fetched_contributors:
        url = f'{BASE_API_URL}/contributors?per_page=100&page={page}'
        response = requests.get(url)
        fetched_contributors = response.json()
        all_contributors += fetched_contributors
        page += 1

    return all_contributors


def main():
    contributors = fetch_contributors()
    with open('contributors.json', 'w') as f:
        json.dump(contributors, f)


if __name__ == '__main__':
    main()