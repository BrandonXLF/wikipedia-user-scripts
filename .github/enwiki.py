import requests
import os

API = 'https://en.wikipedia.org/w/api.php'
USERNAME = 'BrandonXLF'
USER = os.environ['ENWIKI_USER']
PASS = os.environ['ENWIKI_PASS']
SUMMARY = os.environ['GIT_MSG']

s = requests.Session()

r = s.get(API, params={
	'action': 'query',
	'meta': 'tokens',
	'type': 'login',
	'format': 'json'
})

login = r.json()['query']['tokens']['logintoken']

r = s.post(API, data={
	'action': 'login',
	'lgname': USER,
	'lgpassword': PASS,
	'format': 'json',
	'lgtoken': login
})

r = s.get(API, params={
	'action': 'query',
	'meta': 'tokens',
	'type': 'csrf',
	'format': 'json'
})

csrf = r.json()['query']['tokens']['csrftoken']

def edit_file(file, text):
	s.post(API, data={
		'action': 'edit',
		'title': 'User:' + USERNAME + '/' + file,
		'token': csrf,
		'text': text,
		'summary': SUMMARY
	})

for subdir, dirs, files in os.walk(os.getcwd()):
	for file in files:
		if file.endswith('.js') or file.endswith('.css'):
			with open(subdir + os.sep + file) as f:
				edit_file(file, f.read())
