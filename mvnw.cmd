@echo off
set ERROR_CODE=0

@REM set %HOME% to equivalent of $HOME
if "%HOME%" == "" (set "HOME=%HOMEDRIVE%%HOMEPATH%")

@REM Error condition for invalid JAVA_HOME
if not "%JAVA_HOME%" == "" goto valJdkHome

@REM Si JAVA_HOME no esta, intentamos usar 'java' directamente del PATH
java -version >nul 2>&1
if "%ERRORLEVEL%"=="0" (
    set "JAVA_EXE=java"
    goto init
)

echo.
echo Error: JAVA_HOME is not set and 'java' command was not found in PATH.
goto error

:valJdkHome
if exist "%JAVA_HOME%\bin\java.exe" (
    set "JAVA_EXE=%JAVA_HOME%\bin\java.exe"
    goto init
)

echo.
echo Error: JAVA_HOME is set to an invalid directory.
goto error

:init
set MAVEN_PROJECTBASEDIR=%~dp0
set MAVEN_CMD_LINE_ARGS=%*
set WRAPPER_JAR="%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.jar"
set WRAPPER_LAUNCHER=org.apache.maven.wrapper.MavenWrapperMain
set DOWNLOAD_URL="https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.2.0/maven-wrapper-3.2.0.jar"

IF EXIST %WRAPPER_JAR% (
    goto run
)

echo %WRAPPER_JAR% not found, downloading it...
echo Downloading from: %DOWNLOAD_URL%

powershell -NoProfile -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; (New-Object System.Net.WebClient).DownloadFile('%DOWNLOAD_URL%', '%WRAPPER_JAR:"=%')"

IF ERRORLEVEL 1 (
    echo [X] Error: Failed to download maven-wrapper.jar
    set ERROR_CODE=1
    goto error
)

:run
"%JAVA_EXE%" %MAVEN_OPTS% -Dmaven.multiModuleProjectDirectory="%MAVEN_PROJECTBASEDIR%" -classpath "%WRAPPER_JAR:"=%" %WRAPPER_LAUNCHER% %MAVEN_CMD_LINE_ARGS%
if ERRORLEVEL 1 (
    set ERROR_CODE=1
    goto error
)
goto end

:error
if "%ERROR_CODE%"=="0" set ERROR_CODE=1

:end
exit /B %ERROR_CODE%
