#include <iostream>
#include <string>
#include <stdio.h>
#include <emscripten/emscripten.h>
using namespace std;

extern "C"
{
    int * EMSCRIPTEN_KEEPALIVE hello()
    {
        printf("printf\n");
        cout << "Hello World!" << endl;
        int* a = new int(3);
        a[0]=1;
        a[1]=2;
        a[2]=3;
        return a;
    }
}