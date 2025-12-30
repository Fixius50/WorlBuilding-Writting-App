package com.worldbuilding.app.config;

import com.worldbuilding.app.model.Usuario;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;

@Component
public class TenantInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            Usuario user = (Usuario) session.getAttribute("user");
            if (user != null) {
                TenantContext.setCurrentTenant(user.getId());
            } else {
                TenantContext.clear();
            }
        } else {
            TenantContext.clear();
        }
        return true;
    }

    @Override
    public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler,
            ModelAndView modelAndView) {
        TenantContext.clear();
    }
}
