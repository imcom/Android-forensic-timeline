

f=open('../nodejs_server/som_config.js')
lines = f.read()

configs = dict(map(lambda x:x[0:-1].split('='), lines.strip().split('\n')))

print configs.values()
print int(configs.values()[0])
