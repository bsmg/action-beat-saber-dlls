# Beat Saber DLLs Action
_Use stripped Beat Saber DLLs in GitHub Actions_

Fetches DLLs from https://github.com/beat-saber-modding-group/beat-saber-dlls

## Config
See [`action.yml`](https://github.com/beat-saber-modding-group/action-beat-saber-dlls/blob/master/action.yml) for configuration.

## Example Workflow
```yml
name: .NET Build
on: [push]

jobs:
  build:
    runs-on: windows-latest
    steps:
    - uses: actions/checkout@v1
    - name: Setup MSBuild
      uses: warrenbuckley/Setup-MSBuild@v1
    - name: Add Beat Saber DLLs
      uses: beat-saber-modding-group/action-beat-saber-dlls@v1
    - name: Install dependencies
      run: msbuild -t:restore
    - name: Build project
      run: msbuild /t:Build /p:Configuration=Release /p:ReferencePath="D:\beat-saber-dlls"
```
