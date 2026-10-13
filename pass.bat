call npm run build
if exist "C:\Proyectos\ingenieria de software\Ingsoftware\public" rmdir /s /q "C:\Proyectos\ingenieria de software\Ingsoftware\public"
mkdir "C:\Proyectos\ingenieria de software\Ingsoftware\public"
robocopy "C:\Proyectos\ingenieria de software\frontend\dist" "C:\Proyectos\ingenieria de software\Ingsoftware\public" /E /Z /MT:16 /IS
