import requests
import windows
def jq(fn, err):
    url = jq.url
    data = jq.json
    param = jq.param
    hideloading = jq.hideloading
    ajax_req(url, data, param, hideloading, fn, err)
    jq.hideloading = False

def ajax_req(url, data, param, hideloading, fn, err):
    if not url:
        if param:
            url = web_root() + "/ServerAPI?" + param
        else:
            url = web_root() + "/ServerAPI"
    if not hideloading:
        jq.wait('show')
    token = window.localStorage.getItem("Token")
    if token is None:
        token = ''
    headers = {'Token': token}
    try:
        response = requests.post(url, json=data, headers=headers, timeout=10)
        response.raise_for_status()
        data = response.json()
        if data.get('TimeOut'):
            # 超时处理
            top.location.href = ret_login()
        else:
            jq.wait('hide')
            fn(data)
    except requests.exceptions.RequestException as e:
        jq.wait('hide')
        if err:
            err(str(e))

# 示例用法
jq.url = 'https://my-api.com/endpoint'
jq.json = {'key': 'value'}
jq.param = None
jq.hideloading = False

def success(data):
    print('Success:', data)

def error(message):
    print('Error:', message)

jq(success, error)
