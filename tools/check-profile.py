#!/usr/bin/env python3
"""Validate public profile data and links; --remote checks current upstream state."""
import argparse
import concurrent.futures
import json
import os
from pathlib import Path
import re
import urllib.parse
import urllib.request
from html.parser import HTMLParser

ROOT = Path(__file__).resolve().parent.parent


def require(condition, message):
    if not condition:
        raise ValueError(message)


def bilingual(value, location):
    if isinstance(value, dict):
        if 'ko' in value or 'en' in value:
            require(bool(value.get('ko')) and bool(value.get('en')), f'{location}: missing translation')
            require(type(value['ko']) is type(value['en']), f'{location}: translation type mismatch')
        for key, child in value.items():
            bilingual(child, f'{location}.{key}')
    elif isinstance(value, list):
        for i, child in enumerate(value):
            bilingual(child, f'{location}[{i}]')


class Assets(HTMLParser):
    def __init__(self):
        super().__init__()
        self.urls = []

    def handle_starttag(self, tag, attrs):
        self.urls.extend(v for k, v in attrs if k in ('src', 'href') and v)


def fetch(url):
    headers = {'User-Agent': 'kcenon-profile-validation'}
    token = os.environ.get('GITHUB_TOKEN')
    if token and urllib.parse.urlsplit(url).hostname == 'api.github.com':
        headers['Authorization'] = f'Bearer {token}'
    with urllib.request.urlopen(urllib.request.Request(url, headers=headers), timeout=30) as response:
        body = response.read()
        if 'svg' in response.headers.get('Content-Type', ''):
            require(not re.search(rb'Maximum retries exceeded|Something went wrong|API rate limit exceeded', body, re.I),
                    f'{url}: error image returned with HTTP 200')
        return body


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--remote', action='store_true')
    args = parser.parse_args()
    data = {}
    for path in sorted((ROOT / 'portfolio/data').glob('*.json')):
        data[path.stem] = json.loads(path.read_text())
        bilingual(data[path.stem], path.name)

    projects = data['projects']
    entries = [entry for category in projects.values() if isinstance(category, list) for entry in category]
    ids = [entry['id'] for entry in entries]
    require(len(ids) == len(set(ids)), 'Duplicate project IDs')
    for job in data['career']['timeline']:
        require(all(ref in ids for ref in job.get('relatedProjects', [])), f'{job["id"]}: missing project reference')

    catalog = projects['openSource']
    repos = [p['github'].removeprefix('https://github.com/kcenon/') for p in catalog]
    require(len(repos) == len(set(repos)), 'Duplicate catalog repositories')
    urls = set()
    for project in catalog:
        require(re.fullmatch(r'https://github.com/kcenon/[\w-]+', project['github']), f'{project["id"]}: invalid repository URL')
        for key in ('group', 'status', 'description'):
            require(isinstance(project.get(key), dict) and set(project[key]) == {'ko', 'en'}, f'{project["id"]}: missing bilingual {key}')
        require(project.get('sources'), f'{project["id"]}: missing source links')
        require(re.fullmatch(r'\d{4}-\d{2}-\d{2}', project.get('reviewedAt', '')), f'{project["id"]}: missing review date')
        for source in project['sources']:
            require(source['url'].startswith(project['github'] + '/blob/'), f'{project["id"]}: source must identify a repository file')
            urls.add(source['url'])

    readmes = [(ROOT / name).read_text() for name in ('README.md', 'README.ko.md')]
    links = [set(re.findall(r'\]\((https?://[^)]+)\)', text)) for text in readmes]
    require(links[0] == links[1], 'README languages link to different evidence or projects')
    require(len(re.findall(r'^\| \[', readmes[0], re.M)) == 6, 'Expected six selected projects')
    for url in links[0]:
        if '/blob/' in url and url.startswith('https://github.com/kcenon/'):
            urls.add(url)
    for text in readmes:
        for url in re.findall(r'!\[[^\]]*\]\((https?://[^)]+)\)', text):
            urls.add(url)

    for name in ('index.html', 'admin.html'):
        path = ROOT / 'portfolio' / name
        assets = Assets()
        assets.feed(path.read_text())
        for url in assets.urls:
            parsed = urllib.parse.urlsplit(url)
            if not parsed.scheme and parsed.path:
                require((path.parent / parsed.path).is_file(), f'{name}: missing asset {parsed.path}')
    print(f'PASS: {len(data)} JSON files, translations, {len(ids)} project IDs, career references, README evidence parity, local assets')

    if args.remote:
        def repository_check(name):
            meta = json.loads(fetch(f'https://api.github.com/repos/kcenon/{name}'))
            require(not meta['archived'], f'{name}: archived; review catalog inclusion')
            require(not meta['private'], f'{name}: not public')
            for url in urls:
                prefix = f'https://github.com/kcenon/{name}/blob/'
                if url.startswith(prefix):
                    require(url[len(prefix):].split('/')[0] == meta['default_branch'], f'{name}: source is not on the default branch')
            return name

        def link_check(url):
            # Raw content avoids GitHub HTML throttling and confirms the actual file exists.
            target = url.replace('https://github.com/', 'https://raw.githubusercontent.com/').replace('/blob/', '/') if '/blob/' in url else url
            fetch(urllib.parse.urldefrag(target)[0])
            return url

        with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
            list(pool.map(repository_check, repos))
            list(pool.map(link_check, sorted(urls)))
        print(f'PASS: {len(repos)} public repository states and {len(urls)} source/image responses')


if __name__ == '__main__':
    main()
