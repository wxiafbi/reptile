import requests
from bs4 import BeautifulSoup
import json

# 设置登录信息
login_url = 'http://124.115.190.134:8501/View/login.htm'
index_url = 'http://124.115.190.134:8501/View/index.htm'
server_url = 'http://124.115.190.134:8501/ServerAPI'
indicator_diagram_url = 'http://124.115.190.134:8501/View/JS/RealTime/OilRealData.js'
token_url = 'http://124.115.190.134:8501/View/Scripts/common.js'
username = 'Hyadmin'
password = 'Hyadmin123'
captcha_code = 'P4EH'
data = {'route': 'OilMonitor-GetOilMonitorInfoByWell', 'wellName': 'QL郑065平7'}
indicator_diagram_data = {'route': 'DiagramInfo-GetDiagramInfoByWell',
                          'wellName': 'QL郑065平7',
                          'StartDate': '2023-09-03 09:09:45',
                          'EndDate': '2023-09-04 09:09:45',
                          'pageIndex': 1,
                          'pageSize': 15}
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36 Edg/118.0.0.0',
    'Accept': 'application/json, text/javascript, */*; q=0.01',
    'Accept-Encoding': 'gzip, deflate',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
    'Content-Length': '74',
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'Cookie': 'HLOilFieldSCADAMID=hrjz5zdpifqpwbt1kv5mzn02',
    'Host': '124.115.190.134:8501',
    'Origin': 'http://124.115.190.134:8501',
    'Proxy-Connection': 'keep-alive',
    'Referer': 'http://124.115.190.134:8501/View/QiLiCunProject/DataCollectAndMonitor/DataCollectAndMonitor.htm',
    'Token': '1cMjAyMy0wOS0wMSAxNDozNzoxNjQ5NA==cDE2M19IeWFkbWluQDE0Mzc0OTQ=_1354'}
indicator_diagram_headers = {'Accept': 'application/json, text/javascript, */*; q=0.01',
                             'Accept-Encoding': 'gzip, deflate',
                             'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
                             'Content-Length': '162',
                             'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                             'Cookie': 'HLOilFieldSCADAMID=3kge4hucvqtzfzj0j0fvc0qv',
                             'Host': '124.115.190.134:8501',
                             'Origin': 'http://124.115.190.134:8501',
                             'Proxy-Connection': 'keep-alive',
                             'Referer': 'http://124.115.190.134:8501/View/RealTime/OilRealData.htm',
                             #  'Token': '1cMjAyMy0wOS0wNCAxMDoyNzozNTU3Nw==cDE2M19IeWFkbWluQDEwMjc1Nzc=_3988',
                             #  'Token': '1cMjAyMy0wOS0wNCAxMDoyNzozNTU3Nw==cDE2M19IeWFkbWluQDEwMjc1Nzc=_3988',
                             'Token': '1cMjAyMy0wOS0wNCAxMTo1MzoyNTY0Mw==cDE2M19IeWFkbWluQDExNTM2NDM=_6515',
                             'Token': '1cMjAyMy0wOS0wNCAyMToyOTo0NjExNA==cDE2M19IeWFkbWluQDIxMjkxMTQ=_8481',
                             'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36 Edg/118.0.0.0',
                             'X-Requested-With': 'XMLHttpRequest'}
token_headers = {'Referer': 'http://124.115.190.134:8501/View/RealTime/OilRealData.htm',
                 'User-Agent':
                 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36 Edg/118.0.0.0'}
# 创建会话
session = requests.Session()

# 获取验证码并手动输入
# captcha_response = session.get(login_url)
# captcha_soup = BeautifulSoup(captcha_response.text, 'html.parser')
# captcha_img = captcha_soup.find('img', id='captcha_img')
# print('请查看验证码图片：' + captcha_img['src'])
# captcha_code = input('请输入验证码：')

# 登录
login_data = {'username': username,
              'password': password, 'captcha': captcha_code}
session.post(login_url, data=login_data, headers=headers)

# 爬取数据
# response = session.get(index_url, data=data, headers=headers)
response = session.get(token_url, headers=token_headers)
# response = session.post(server_url,
#                         headers=indicator_diagram_headers, data=indicator_diagram_data)
print(response.status_code)
with open('mun_well.js', 'w', encoding='utf-8') as f:
    answer = response.content.decode()
    # J_answer = json.loads(answer)
    # print(J_answer)
    print(answer.index('token'))
    f.write(answer)
