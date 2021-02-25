import os
import re

for subdir, dirs, files in os.walk(os.getcwd() + '/src'):
	prev = ''
	line = ''
	out = '## List\n\n'
	markdown = ''

	for file in files:
		curr, type = file.split('.')
		type = 'JS' if type == 'js' else 'CSS'
		if prev == curr:
			line += ', [{0}](/src/{1})'.format(type, file)
		else:
			if line:
				out += '* {}\n'.format(line)
			page = 'https://en.wikipedia.org/wiki/User:BrandonXLF/' + curr
			line = '{0} - [Doc]({1}), [{2}](/src/{3})'.format(curr, page, type, file)
		prev = curr
	out += '* {}\n\n'.format(line)
	
	with open('README.md', 'r') as f:
		markdown = f.read()
		
	markdown = re.sub(r'## List[^#]*', out, markdown)
		
	with open('README.md', 'w') as f:
		f.write(markdown)
		
print('Updated script list.')