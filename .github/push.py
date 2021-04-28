import requests
import os

USERNAME = 'BrandonXLF'
USER = os.environ['ENWIKI_USER']
PASS = os.environ['ENWIKI_PASS']
SUMMARY = os.environ['GIT_MSG']

s = requests.Session()

r = s.get('https://en.wikipedia.org/w/api.php', params={
	'action': 'query',
	'meta': 'tokens',
	'type': 'login',
	'format': 'json'
})

print('Got login token')

login = r.json()['query']['tokens']['logintoken']

r = s.post('https://en.wikipedia.org/w/api.php', data={
	'action': 'login',
	'lgname': USER,
	'lgpassword': PASS,
	'format': 'json',
	'lgtoken': login
})

print('Logged into English Wikipedia')

r = s.get('https://en.wikipedia.org/w/api.php', params={
	'action': 'query',
	'meta': 'tokens',
	'type': 'csrf',
	'format': 'json'
})

csrf = r.json()['query']['tokens']['csrftoken']

print('Got edit token')

def edit_file(file, text):
	req = s.get('https://en.wikipedia.org/w/index.php', params={
		'action': 'raw',
		'title': 'User:' + USERNAME + '/' + file
	})
	
	if req.ok and req.text == text:
		print('Skipped file ' + file)
		return
	
	s.post('https://en.wikipedia.org/w/api.php', data={
		'action': 'edit',
		'title': 'User:' + USERNAME + '/' + file,
		'token': csrf,
		'text': text,
		'summary': SUMMARY
	})
	
	print('Saved file ' + file)

for subdir, dirs, files in os.walk(os.getcwd() + '/src'):
	for file in files:
		with open(subdir + os.sep + file, encoding='utf8') as f:
			edit_file(file, f.read())
